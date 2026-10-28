package com.trungpd.eventticketplatform.finance.payment;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "payment")
public class PaymentProviderProperties {

    private PaymentProviderType provider = PaymentProviderType.MOCK;
}
