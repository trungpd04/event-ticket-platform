package com.trungpd.eventticketplatform.finance.payment.webhook;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class WebhookResult {

    private final boolean success;
    private final String message;

    public static WebhookResult success() {
        return new WebhookResult(true, null);
    }

    public static WebhookResult success(String message) {
        return new WebhookResult(true, message);
    }

    public static WebhookResult invalid() {
        return new WebhookResult(false, "Invalid webhook");
    }

    public static WebhookResult invalid(String message) {
        return new WebhookResult(false, message);
    }

    public static WebhookResult rejected(String message) {
        return new WebhookResult(false, message);
    }
}
