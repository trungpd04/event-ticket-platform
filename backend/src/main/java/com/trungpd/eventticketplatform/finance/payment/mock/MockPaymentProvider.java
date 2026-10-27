package com.trungpd.eventticketplatform.finance.payment.mock;

import com.trungpd.eventticketplatform.finance.payment.PaymentProvider;
import com.trungpd.eventticketplatform.finance.payment.PaymentProviderType;
import com.trungpd.eventticketplatform.finance.payment.request.PaymentRequest;
import com.trungpd.eventticketplatform.finance.payment.response.PaymentResponse;
import com.trungpd.eventticketplatform.finance.payment.webhook.WebhookResult;
import org.springframework.stereotype.Component;

@Component
public class MockPaymentProvider implements PaymentProvider {

    @Override
    public PaymentProviderType getProviderType() {
        return PaymentProviderType.MOCK;
    }

    @Override
    public PaymentResponse createPaymentInstruction(PaymentRequest request) {
        return PaymentResponse.builder()
                .provider(PaymentProviderType.MOCK)
                .paymentCode(request.getPaymentCode() != null ? request.getPaymentCode() : "MOCK" + request.getOrderId())
                .content("Mock payment for order " + request.getOrderCode())
                .amount(request.getAmount())
                .maxPollCount(300)
                .frequenceCallApiPoll(3000)
                .build();
    }

    @Override
    public WebhookResult processWebhook(String rawPayload) {
        return WebhookResult.success();
    }

    @Override
    public boolean verifyWebhook(String rawPayload, String signatureHeader, String timestampHeader) {
        return true;
    }
}
