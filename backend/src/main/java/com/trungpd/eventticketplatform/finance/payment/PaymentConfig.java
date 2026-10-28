package com.trungpd.eventticketplatform.finance.payment;

import com.trungpd.eventticketplatform.finance.payment.sepay.SePayProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({PaymentProviderProperties.class, SePayProperties.class})
public class PaymentConfig {
}
