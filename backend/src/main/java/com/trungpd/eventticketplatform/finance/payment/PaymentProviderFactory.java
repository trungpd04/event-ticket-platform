package com.trungpd.eventticketplatform.finance.payment;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class PaymentProviderFactory {

    private final Map<PaymentProviderType, PaymentProvider> providers;
    private final PaymentProviderProperties properties;

    public PaymentProviderFactory(List<PaymentProvider> providerList,
                                  PaymentProviderProperties properties) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(PaymentProvider::getProviderType, Function.identity()));
        this.properties = properties;
    }

    public PaymentProvider getProvider() {
        return getProvider(properties.getProvider());
    }

    public PaymentProvider getProvider(PaymentProviderType type) {
        PaymentProvider provider = providers.get(type);
        if (provider == null) {
            throw new BusinessException("error.payment.provider-not-supported");
        }
        return provider;
    }

    public Set<PaymentProviderType> getSupportedProviderTypes() {
        return providers.keySet();
    }

    public boolean isSupported(PaymentProviderType type) {
        return providers.containsKey(type);
    }
}
