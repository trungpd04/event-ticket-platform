package com.trungpd.eventticketplatform.finance.payout.service;

public record PayoutEligibilityResult(boolean allowed, String reasonCode) {
}
