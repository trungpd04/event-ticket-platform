package com.trungpd.eventticketplatform.finance.payment.response;

import com.trungpd.eventticketplatform.finance.payment.PaymentProviderType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PaymentResponse {

    private PaymentProviderType provider;
    private String paymentCode;
    private String qrUrl;
    private String accountNumber;
    private String bankCode;
    private String bankName;
    private String content;
    private Long amount;
    private Integer maxPollCount;
    private Integer frequenceCallApiPoll;
    private String redirectUrl;
    private String paymentUrl;
}
