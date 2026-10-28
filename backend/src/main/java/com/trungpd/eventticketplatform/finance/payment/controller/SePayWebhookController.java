package com.trungpd.eventticketplatform.finance.payment.controller;

import com.trungpd.eventticketplatform.finance.payment.PaymentProviderFactory;
import com.trungpd.eventticketplatform.finance.payment.PaymentProviderType;
import com.trungpd.eventticketplatform.finance.payment.webhook.WebhookResult;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
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

    @PostMapping("/sepay")
    public ResponseEntity<Map<String, Boolean>> handleSePayWebhook(HttpServletRequest request) {
        String rawPayload;
        try {
            BufferedReader reader = request.getReader();
            rawPayload = reader.lines().collect(java.util.stream.Collectors.joining());
        } catch (Exception e) {
            log.warn("Unable to read SePay webhook body", e);
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }

        String signature = request.getHeader(SEPAY_SIGNATURE_HEADER);
        String timestamp = request.getHeader(SEPAY_TIMESTAMP_HEADER);

        var provider = providerFactory.getProvider(PaymentProviderType.SEPAY);
        if (!provider.verifyWebhook(rawPayload, signature, timestamp)) {
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
