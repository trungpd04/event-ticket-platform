package com.trungpd.eventticketplatform.finance.payment;

import com.trungpd.eventticketplatform.finance.payment.request.PaymentRequest;
import com.trungpd.eventticketplatform.finance.payment.response.PaymentResponse;
import com.trungpd.eventticketplatform.finance.payment.webhook.WebhookResult;

public interface PaymentProvider {

    PaymentProviderType getProviderType();

    PaymentResponse createPaymentInstruction(PaymentRequest request);

    WebhookResult processWebhook(String rawPayload);

    boolean verifyWebhook(String rawPayload, String signatureHeader, String timestampHeader);
}
