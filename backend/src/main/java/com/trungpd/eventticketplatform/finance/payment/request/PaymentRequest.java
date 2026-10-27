package com.trungpd.eventticketplatform.finance.payment.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PaymentRequest {

    private Long orderId;
    private String orderCode;
    private String paymentCode;
    private Long amount;
    private String description;
    private String customerEmail;
    private String customerName;
    private String returnUrl;
    private String cancelUrl;
}
