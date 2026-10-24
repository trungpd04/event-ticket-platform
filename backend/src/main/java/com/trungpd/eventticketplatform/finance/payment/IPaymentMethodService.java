package com.trungpd.eventticketplatform.finance.payment;

import java.util.List;

public interface IPaymentMethodService {

    List<PaymentMethod> getActivePaymentMethods();

    boolean isSupported(PaymentProviderType providerType);
}
