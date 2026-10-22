package com.trungpd.eventticketplatform.orders.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.common.mapper.PaginationMapper;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.Promotion;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.events.repository.PromotionRepository;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.EmailService;
import com.trungpd.eventticketplatform.identity.service.UserService;
import com.trungpd.eventticketplatform.orders.dto.request.CreateOrderRequest;
import com.trungpd.eventticketplatform.orders.dto.request.MockPaymentRequest;
import com.trungpd.eventticketplatform.orders.dto.response.MockPaymentResponse;
import com.trungpd.eventticketplatform.orders.dto.response.OrderItemResponse;
import com.trungpd.eventticketplatform.orders.dto.response.OrderResponse;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.entity.OrderDetail;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderDetailRepository;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import com.trungpd.eventticketplatform.ticketing.repository.TicketRepository;
import com.trungpd.eventticketplatform.ticketing.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserService userService;
    private final EventRepository eventRepository;
    private final PromotionRepository promotionRepository;
    private final EmailService emailService;
    private final PaginationMapper paginationMapper;

    @Transactional
    public OrderResponse createFromReservation(Long userId, CreateOrderRequest request) {
        User user = userService.findById(userId);
        Order order = orderRepository.findByOrderCode(request.getReservationId())
                .orElseThrow(() -> new NotFoundException("error.order.not-found"));
        validateOwner(order, user.getId());
        validatePending(order);
        validateNotExpired(order);
        ensureFeesSnapshot(order);
        applyPromotion(order, request.getPromotionCode());
        return toResponse(order);
    }

    @Transactional
    public MockPaymentResponse mockPay(Long userId, Long orderId, MockPaymentRequest request) {
        User user = userService.findById(userId);
        Order order = findOwned(orderId, user.getId());
        validatePending(order);
        validateNotExpired(order);

        if (!"MOCK_VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            throw new BusinessException("error.order.invalid-payment-method");
        }

        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());
        List<Long> detailIds = details.stream().map(OrderDetail::getId).toList();
        List<Ticket> tickets = ticketRepository.findByOrderDetailIdIn(detailIds);
        int expectedQuantity = details.stream().mapToInt(OrderDetail::getQuantity).sum();

        if (tickets.size() < expectedQuantity) {
            throw new BusinessException("error.ticket.not-enough-reserved");
        }
        if (tickets.stream().anyMatch(t -> t.getStatus() != TicketStatus.RESERVED)) {
            throw new BusinessException("error.ticket.invalid-status");
        }

        LocalDateTime paidAt = LocalDateTime.now();
        tickets.forEach(ticket -> {
            ticket.setStatus(TicketStatus.PAID);
            ticket.setReservedUntil(null);
            ticket.setQrCode(generateQrCode(ticket.getId(), order.getId(), order.getEventId()));
        });
        ticketRepository.saveAll(tickets);

        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(paidAt);
        orderRepository.save(order);

        if (order.getPromotionId() != null) {
            int updated = promotionRepository.incrementUsedCount(order.getPromotionId());
            if (updated == 0) {
                throw new BusinessException("error.promotion.usage-limit-exceeded");
            }
        }

        emailService.sendTicketEmail(user.getEmail(), "Your event tickets - " + order.getOrderCode(),
                buildEmailBody(order, tickets));

        return MockPaymentResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .paidAt(paidAt)
                .finalAmount(order.getFinalAmount())
                .message(request.getReturnMessage() != null && !request.getReturnMessage().isBlank()
                        ? request.getReturnMessage()
                        : "Payment successful (mock)")
                .build();
    }

    @Transactional
    public void cancel(Long userId, Long orderId) {
        User user = userService.findById(userId);
        Order order = findOwned(orderId, user.getId());
        validatePending(order);
        validateNotExpired(order);
        release(order);
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse get(Long userId, Long orderId) {
        User user = userService.findById(userId);
        Order order = findAccessible(orderId, user);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> myOrders(Long userId, OrderStatus status, int page, int size) {
        User user = userService.findById(userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = status == null
                ? orderRepository.findByCustomerId(user.getId(), pageable)
                : orderRepository.findByCustomerIdAndStatus(user.getId(), status, pageable);
        return paginationMapper.toPagedResponse(orders.map(this::toResponse));
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expirePendingOrders() {
        orderRepository.findByStatusAndExpiredAtBefore(OrderStatus.PENDING_PAYMENT, LocalDateTime.now())
                .forEach(order -> {
                    release(order);
                    order.setStatus(OrderStatus.EXPIRED);
                    orderRepository.save(order);
                });
    }

    private void ensureFeesSnapshot(Order order) {
        if (order.getPlatformFee() != null && order.getPlatformFee() > 0
                && order.getCommissionFee() != null && order.getCommissionFee() > 0) {
            return;
        }
        Event event = eventRepository.findById(order.getEventId())
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        long total = order.getTotalTicketAmount() == null ? 0L : order.getTotalTicketAmount();
        long platformFee = 0L;
        long commissionFee = 0L;

        if (event.getCustomerFlatFeeSnapshot() != null) {
            platformFee += event.getCustomerFlatFeeSnapshot();
        }
        if (event.getCustomerFeeRateSnapshot() != null) {
            platformFee += BigDecimal.valueOf(total)
                    .multiply(event.getCustomerFeeRateSnapshot())
                    .setScale(0, RoundingMode.DOWN)
                    .longValue();
        }
        if (event.getOrganizerCommissionRateSnapshot() != null) {
            commissionFee = BigDecimal.valueOf(total)
                    .multiply(event.getOrganizerCommissionRateSnapshot())
                    .setScale(0, RoundingMode.DOWN)
                    .longValue();
        }

        order.setPlatformFee(platformFee);
        order.setCommissionFee(commissionFee);
        long currentDiscount = order.getDiscountAmount() == null ? 0L : order.getDiscountAmount();
        order.setFinalAmount(total - currentDiscount + platformFee);
        orderRepository.save(order);
    }

    private void applyPromotion(Order order, String code) {
        if (code == null || code.isBlank()) return;
        if (order.getPromotionId() != null) {
            throw new BusinessException("error.order.promotion-already-applied");
        }
        Event event = eventRepository.findById(order.getEventId())
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));
        Promotion promotion = promotionRepository.findByEventIdAndCodeIgnoreCase(event.getId(), code)
                .orElseThrow(() -> new BusinessException("error.promotion.invalid"));
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promotion.getValidFrom()) || now.isAfter(promotion.getValidUntil())
                || promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new BusinessException("error.promotion.invalid");
        }

        long total = order.getTotalTicketAmount() == null ? 0L : order.getTotalTicketAmount();
        long maxDiscount = promotion.getMaxDiscount() == null ? Long.MAX_VALUE : promotion.getMaxDiscount();
        long discount = BigDecimal.valueOf(total)
                .multiply(promotion.getDiscountPercent())
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN)
                .min(BigDecimal.valueOf(maxDiscount))
                .longValue();
        discount = Math.min(discount, total);

        order.setPromotionId(promotion.getId());
        order.setPromotionDiscountPercent(promotion.getDiscountPercent());
        order.setPromotionMaxDiscount(promotion.getMaxDiscount());
        order.setDiscountAmount(discount);
        order.setFinalAmount(total - discount + order.getPlatformFee());
        orderRepository.save(order);
    }

    private void release(Order order) {
        List<Long> ids = orderDetailRepository.findByOrderId(order.getId()).stream()
                .map(OrderDetail::getId)
                .toList();
        if (!ids.isEmpty()) {
            ticketRepository.releaseTicketsByOrderDetailIds(ids);
        }
        if (order.getPromotionId() != null) {
            promotionRepository.decrementUsedCount(order.getPromotionId());
        }
    }

    private void validateNotExpired(Order order) {
        if (order.getExpiredAt() != null && order.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("error.order.expired");
        }
    }

    private Order findOwned(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.order.not-found"));
        validateOwner(order, userId);
        return order;
    }

    private Order findAccessible(Long id, User user) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.order.not-found"));
        Set<Role> roles = user.getRoles();
        if (roles.contains(Role.ADMIN)) {
            return order;
        }
        if (roles.contains(Role.ORGANIZER)) {
            Event event = eventRepository.findById(order.getEventId())
                    .orElseThrow(() -> new NotFoundException("error.event.not-found"));
            if (event.getOrganizerId().equals(user.getId())) {
                return order;
            }
        }
        validateOwner(order, user.getId());
        return order;
    }

    private void validateOwner(Order order, Long userId) {
        if (!order.getCustomerId().equals(userId)) {
            throw new BusinessException("error.order.not-owner");
        }
    }

    private void validatePending(Order order) {
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessException("error.order.cannot-pay");
        }
    }

    private OrderResponse toResponse(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());
        Map<Long, TicketType> ticketTypeMap = ticketTypeRepository.findAllById(
                        details.stream().map(OrderDetail::getTicketTypeId).toList())
                .stream()
                .collect(Collectors.toMap(TicketType::getId, Function.identity()));

        List<OrderItemResponse> items = details.stream()
                .map(detail -> {
                    TicketType ticketType = ticketTypeMap.get(detail.getTicketTypeId());
                    return OrderItemResponse.builder()
                            .ticketTypeId(detail.getTicketTypeId())
                            .ticketTypeName(ticketType != null ? ticketType.getName() : null)
                            .quantity(detail.getQuantity())
                            .unitPrice(detail.getUnitPrice())
                            .subtotal(detail.getSubtotal())
                            .build();
                })
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomerId())
                .eventId(order.getEventId())
                .status(order.getStatus())
                .totalTicketAmount(order.getTotalTicketAmount())
                .discountAmount(order.getDiscountAmount())
                .platformFee(order.getPlatformFee())
                .commissionFee(order.getCommissionFee())
                .finalAmount(order.getFinalAmount())
                .paidAt(order.getPaidAt())
                .expiredAt(order.getExpiredAt())
                .items(items)
                .build();
    }

    private String generateQrCode(Long ticketId, Long orderId, Long eventId) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(("TICKET:%d:ORDER:%d:EVENT:%d:%d".formatted(
                            ticketId, orderId, eventId, System.currentTimeMillis())).getBytes());
            return HexFormat.of().formatHex(digest);
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
}
