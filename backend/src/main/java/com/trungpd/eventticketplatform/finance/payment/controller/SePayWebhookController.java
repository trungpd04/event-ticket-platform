package com.trungpd.eventticketplatform.finance.payment.controller;

import com.trungpd.eventticketplatform.finance.payment.PaymentProviderFactory;
import com.trungpd.eventticketplatform.finance.payment.PaymentProviderType;
import com.trungpd.eventticketplatform.finance.payment.webhook.WebhookResult;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Tag(name = "Payment Webhooks")
public class SePayWebhookController {

    private final PaymentProviderFactory providerFactory;

    private static final String SEPAY_SIGNATURE_HEADER = "X-SePay-Signature";
    private static final String SEPAY_TIMESTAMP_HEADER = "X-SePay-Timestamp";
    private static final String AUTHORIZATION_HEADER = "Authorization";

    @PostMapping(value = "/sepay", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Boolean>> handleSePayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = SEPAY_SIGNATURE_HEADER, required = false) String signature,
            @RequestHeader(value = SEPAY_TIMESTAMP_HEADER, required = false) String timestamp,
            @RequestHeader(value = AUTHORIZATION_HEADER, required = false) String authorization) {

        var provider = providerFactory.getProvider(PaymentProviderType.SEPAY);
        // HMAC uses X-SePay-Signature; API Key authentication uses Authorization.
        String authenticationHeader = signature != null ? signature : authorization;
        if (!provider.verifyWebhook(rawPayload, authenticationHeader, timestamp)) {
            log.warn("SePay webhook verification failed");
            return ResponseEntity.status(401).body(Map.of("success", false));
        }

        WebhookResult result = provider.processWebhook(rawPayload);
        if (result.isSuccess()) {
            return ResponseEntity.ok(Map.of("success", true));
        }
        log.warn("SePay webhook processing failed: {}", result.getMessage());
        return ResponseEntity.badRequest().body(Map.of("success", false));
    }
}
