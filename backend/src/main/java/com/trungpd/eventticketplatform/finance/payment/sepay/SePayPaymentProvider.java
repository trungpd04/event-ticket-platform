package com.trungpd.eventticketplatform.finance.payment.sepay;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
import com.trungpd.eventticketplatform.events.repository.OptionSetValueRepository;
import com.trungpd.eventticketplatform.events.repository.PromotionRepository;
import com.trungpd.eventticketplatform.finance.payment.PaymentProvider;
import com.trungpd.eventticketplatform.finance.payment.PaymentProviderType;
import com.trungpd.eventticketplatform.finance.payment.entity.PaymentTransaction;
import com.trungpd.eventticketplatform.finance.payment.repository.PaymentTransactionRepository;
import com.trungpd.eventticketplatform.finance.payment.request.PaymentRequest;
import com.trungpd.eventticketplatform.finance.payment.response.PaymentResponse;
import com.trungpd.eventticketplatform.finance.payment.webhook.WebhookResult;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.IEmailService;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderDetailRepository;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import com.trungpd.eventticketplatform.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SePayPaymentProvider implements PaymentProvider {

    private static final String OPTION_SET_CODE = "PAYMENT_CONFIG";
    private static final String MAX_POLL_COUNT_CODE = "MAX_POLL_COUNT";
    private static final String FREQUENCE_POLL_CODE = "FREQUENCE_CALL_API_POLL";
    private static final int PAYMENT_CODE_SUFFIX_LENGTH = 8;

    private final SePayProperties properties;
    private final SePayWebhookVerifier verifier;
    private final SePayQrCodeBuilder qrCodeBuilder;
    private final ObjectMapper objectMapper;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final TicketRepository ticketRepository;
    private final OptionSetValueRepository optionSetValueRepository;
    private final IUserService userService;
    private final IEmailService emailService;
    private final PromotionRepository promotionRepository;

    @Override
    public PaymentProviderType getProviderType() {
        return PaymentProviderType.SEPAY;
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse createPaymentInstruction(PaymentRequest request) {
        String paymentCode = request.getPaymentCode() != null && !request.getPaymentCode().isBlank()
                ? request.getPaymentCode()
                : generatePaymentCode();
        String content = paymentCode;

        String qrUrl = qrCodeBuilder.build(
                properties.getAccountNumber(),
                properties.getBankCode(),
                request.getAmount(),
                content
        );

        int maxPollCount = getIntOption(MAX_POLL_COUNT_CODE, 300);
        int frequenceCallApiPoll = getIntOption(FREQUENCE_POLL_CODE, 3000);

        return PaymentResponse.builder()
                .provider(PaymentProviderType.SEPAY)
                .paymentCode(paymentCode)
                .qrUrl(qrUrl)
                .accountNumber(properties.getAccountNumber())
                .bankCode(properties.getBankCode())
                .content(content)
                .amount(request.getAmount())
                .maxPollCount(maxPollCount)
                .frequenceCallApiPoll(frequenceCallApiPoll)
                .build();
    }

    @Override
    public boolean verifyWebhook(String rawPayload, String signatureHeader, String timestampHeader) {
        return verifier.verify(rawPayload, signatureHeader, timestampHeader);
    }

    @Override
    @Transactional
    public WebhookResult processWebhook(String rawPayload) {
        SePayWebhookPayload payload;
        try {
            payload = objectMapper.readValue(rawPayload, SePayWebhookPayload.class);
        } catch (Exception e) {
            log.warn("Unable to parse SePay webhook payload", e);
            return WebhookResult.invalid("Invalid payload");
        }

        if (payload.getId() == null) {
            return WebhookResult.invalid("Missing transaction id");
        }

        String externalTransactionId = String.valueOf(payload.getId());

        if (paymentTransactionRepository.existsByExternalTransactionIdAndProvider(externalTransactionId, PaymentProviderType.SEPAY)) {
            log.info("SePay webhook transaction {} already processed", externalTransactionId);
            return WebhookResult.success();
        }

        PaymentTransaction transaction = new PaymentTransaction(
                externalTransactionId,
                PaymentProviderType.SEPAY,
                payload.getTransferAmount() == null ? 0L : payload.getTransferAmount(),
                "RECEIVED",
                rawPayload
        );
        transaction.setPaymentCode(payload.getCode());
        paymentTransactionRepository.save(transaction);

        if (!"in".equalsIgnoreCase(payload.getTransferType())) {
            log.info("SePay webhook transaction {} is not incoming transfer", externalTransactionId);
            return WebhookResult.success();
        }

        if (payload.getCode() == null || payload.getCode().isBlank()) {
            log.info("SePay webhook transaction {} has no payment code", externalTransactionId);
            return WebhookResult.success();
        }

        Order order = orderRepository.findByPaymentCode(payload.getCode())
                .orElse(null);

        if (order == null) {
            log.warn("SePay webhook transaction {}: order not found for code {}",
                    externalTransactionId, payload.getCode());
            return WebhookResult.success("Order not found");
        }

        transaction.setOrderId(order.getId());
        paymentTransactionRepository.save(transaction);

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            log.info("SePay webhook transaction {}: order {} is not pending payment",
                    externalTransactionId, order.getId());
            return WebhookResult.success();
        }

        if (order.getExpiredAt() != null && order.getExpiredAt().isBefore(LocalDateTime.now())) {
            log.warn("SePay webhook transaction {}: order {} expired", externalTransactionId, order.getId());
            return WebhookResult.success("Order expired");
        }

        Long expectedAmount = order.getFinalAmount();
        Long actualAmount = payload.getTransferAmount() == null ? 0L : payload.getTransferAmount();
        if (!expectedAmount.equals(actualAmount)) {
            log.warn("SePay webhook transaction {}: amount mismatch. Expected {}, actual {}",
                    externalTransactionId, expectedAmount, actualAmount);
            return WebhookResult.success("Amount mismatch");
        }

        LocalDateTime paidAt = LocalDateTime.now();
        int updated = orderRepository.markPaidIfPending(
                order.getId(), transaction.getId(), expectedAmount, paidAt
        );

        if (updated == 0) {
            log.info("SePay webhook transaction {}: order {} was already paid or amount changed",
                    externalTransactionId, order.getId());
            return WebhookResult.success();
        }

        if (order.getPromotionId() != null) {
            promotionRepository.incrementUsedCount(order.getPromotionId());
        }

        confirmTickets(order);

        log.info("SePay webhook transaction {}: order {} marked as PAID",
                externalTransactionId, order.getId());

        return WebhookResult.success();
    }

    private void confirmTickets(Order order) {
        List<Long> detailIds = orderDetailRepository.findByOrderId(order.getId()).stream()
                .map(com.trungpd.eventticketplatform.orders.entity.OrderDetail::getId)
                .toList();
        if (detailIds.isEmpty()) {
            return;
        }

        int confirmed = ticketRepository.markPaidByOrderDetailIds(detailIds);
        if (confirmed == 0) {
            log.warn("No reserved tickets found to confirm for order {}", order.getId());
            return;
        }

        List<Ticket> tickets = ticketRepository.findByOrderDetailIdIn(detailIds);
        tickets.forEach(ticket -> {
            if (ticket.getQrCode() == null || ticket.getQrCode().isBlank()) {
                ticket.setQrCode(generateQrCode(ticket.getId(), order.getId(), order.getEventId()));
            }
        });
        ticketRepository.saveAll(tickets);

        try {
            User user = userService.findById(order.getCustomerId());
            emailService.sendTicketEmail(
                    user.getEmail(),
                    "Your event tickets - " + order.getOrderCode(),
                    buildEmailBody(order, tickets)
            );
        } catch (Exception e) {
            log.error("Failed to send ticket email for order {}", order.getId(), e);
        }
    }

    private String generateQrCode(Long ticketId, Long orderId, Long eventId) {
        try {
            byte[] digest = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(("TICKET:%d:ORDER:%d:EVENT:%d:%d".formatted(
                            ticketId, orderId, eventId, System.currentTimeMillis())).getBytes());
            return java.util.HexFormat.of().formatHex(digest);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to generate ticket QR code", exception);
        }
    }

    private String buildEmailBody(Order order, List<Ticket> tickets) {
        StringBuilder body = new StringBuilder("Ticket details\n\n");
        tickets.forEach(ticket -> body.append("Ticket #")
                .append(ticket.getId())
                .append("\nQR Code: ")
                .append(ticket.getQrCode())
                .append("\n\n"));
        return body.toString();
    }

    private String generatePaymentCode() {
        String prefix = properties.getPaymentPrefix();
        if (prefix == null || prefix.isBlank()) {
            prefix = "DH";
        }
        String suffix = generateRandomAlphanumeric(PAYMENT_CODE_SUFFIX_LENGTH);
        return (prefix + suffix).toUpperCase();
    }

    private String generateRandomAlphanumeric(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private int getIntOption(String code, int defaultValue) {
        return optionSetValueRepository.findByOptionSetCodeAndCode(OPTION_SET_CODE, code)
                .map(OptionSetValue::getValue)
                .map(this::parseInt)
                .orElse(defaultValue);
    }

    private int parseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
