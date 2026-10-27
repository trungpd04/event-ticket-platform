package com.trungpd.eventticketplatform.finance.payment;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.finance.payment.request.PaymentRequest;
import com.trungpd.eventticketplatform.finance.payment.response.PaymentResponse;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {

    private final PaymentProviderFactory providerFactory;
    private final IPaymentMethodService paymentMethodService;
    private final OrderRepository orderRepository;
    private final IUserService userService;

    @Transactional
    public PaymentResponse createPaymentInstruction(Long userId, Long orderId, PaymentProviderType requestedProvider) {
        User user = userService.findById(userId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("error.order.not-found"));

        validateOwner(order, user.getId());
        validatePending(order);
        validateNotExpired(order);

        PaymentProviderType providerType = resolveProviderType(order, requestedProvider);

        if (!providerFactory.isSupported(providerType)) {
            throw new BusinessException("error.payment.provider-not-supported");
        }

        if (!paymentMethodService.isSupported(providerType)) {
            throw new BusinessException("error.payment.provider-not-available");
        }

        PaymentProvider provider = providerFactory.getProvider(providerType);

        PaymentResponse response = provider.createPaymentInstruction(
                PaymentRequest.builder()
                        .orderId(order.getId())
                        .orderCode(order.getOrderCode())
                        .paymentCode(order.getPaymentCode())
                        .amount(order.getFinalAmount())
                        .customerEmail(user.getEmail())
                        .customerName(user.getFullName())
                        .build()
        );

        if (order.getPaymentCode() == null) {
            order.setPaymentCode(response.getPaymentCode());
            order.setPaymentProvider(provider.getProviderType().name());
            orderRepository.save(order);
        }

        return response;
    }

    private PaymentProviderType resolveProviderType(Order order, PaymentProviderType requestedProvider) {
        if (order.getPaymentProvider() != null && !order.getPaymentProvider().isBlank()) {
            try {
                return PaymentProviderType.valueOf(order.getPaymentProvider());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("error.payment.provider-invalid");
            }
        }
        return requestedProvider != null ? requestedProvider : providerFactory.getProvider().getProviderType();
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(Long userId, Long orderId) {
        User user = userService.findById(userId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("error.order.not-found"));

        validateOwner(order, user.getId());

        return PaymentStatusResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .paidAt(order.getPaidAt())
                .build();
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

    private void validateNotExpired(Order order) {
        if (order.getExpiredAt() != null && order.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("error.order.expired");
        }
    }
}
