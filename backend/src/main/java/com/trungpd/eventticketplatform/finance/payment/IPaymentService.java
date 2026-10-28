package com.trungpd.eventticketplatform.finance.payment;

import com.trungpd.eventticketplatform.finance.payment.response.PaymentResponse;

public interface IPaymentService {

    PaymentResponse createPaymentInstruction(Long userId, Long orderId, PaymentProviderType requestedProvider);

    PaymentStatusResponse getPaymentStatus(Long userId, Long orderId);
}
