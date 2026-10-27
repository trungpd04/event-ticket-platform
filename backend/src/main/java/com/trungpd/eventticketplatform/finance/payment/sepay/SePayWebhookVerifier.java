package com.trungpd.eventticketplatform.finance.payment.sepay;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

@Slf4j
@Component
@RequiredArgsConstructor
public class SePayWebhookVerifier {

    private static final long TIMESTAMP_TOLERANCE_SECONDS = 300;

    private final SePayProperties properties;

    public boolean verify(String rawPayload, String signatureHeader, String timestampHeader) {
        String webhookSecret = properties.getWebhookSecret();
        String apiKey = properties.getApiKey();

        if (webhookSecret != null && !webhookSecret.isBlank()) {
            return verifyHmac(rawPayload, signatureHeader, timestampHeader, webhookSecret);
        }

        if (apiKey != null && !apiKey.isBlank()) {
            return verifyApiKey(signatureHeader, apiKey);
        }

        log.warn("SePay webhook verification is not configured");
        return false;
    }

    private boolean verifyHmac(String rawPayload,
                               String signatureHeader,
                               String timestampHeader,
                               String secret) {
        if (signatureHeader == null || timestampHeader == null) {
            return false;
        }

        long timestamp;
        try {
            timestamp = Long.parseLong(timestampHeader);
        } catch (NumberFormatException e) {
            return false;
        }

        long now = Instant.now().getEpochSecond();
        if (Math.abs(now - timestamp) > TIMESTAMP_TOLERANCE_SECONDS) {
            log.warn("SePay webhook timestamp out of tolerance: {} vs {}", timestamp, now);
            return false;
        }

        String expected = "sha256=" + hmacSha256(timestamp + "." + rawPayload, secret);
        return constantTimeEquals(expected, signatureHeader);
    }

    private boolean verifyApiKey(String authorizationHeader, String expectedApiKey) {
        if (authorizationHeader == null) {
            return false;
        }
        String expected = "Apikey " + expectedApiKey;
        return constantTimeEquals(expected, authorizationHeader);
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to compute HMAC-SHA256", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);
        return java.security.MessageDigest.isEqual(aBytes, bBytes);
    }
}
