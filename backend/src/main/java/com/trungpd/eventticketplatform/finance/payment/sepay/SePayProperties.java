package com.trungpd.eventticketplatform.finance.payment.sepay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "payment.sepay")
public class SePayProperties {

    private boolean enabled;
    private String apiKey;
    private String webhookSecret;
    private String accountNumber;
    private String bankCode;
    private String paymentPrefix = "DH";
}
