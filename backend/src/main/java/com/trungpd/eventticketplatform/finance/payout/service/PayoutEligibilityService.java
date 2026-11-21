package com.trungpd.eventticketplatform.finance.payout.service;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventPayoutInfo;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.repository.EventPayoutInfoRepository;
import com.trungpd.eventticketplatform.finance.payout.PayoutStatus;
import com.trungpd.eventticketplatform.finance.payout.repository.PayoutRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PayoutEligibilityService {

    private final EventPayoutInfoRepository eventPayoutInfoRepository;
    private final PayoutRequestRepository payoutRequestRepository;

    @Value("${app.payout.hold-days:7}")
    private int holdDays;

    @Value("${app.payout.min-amount:100000}")
    private long minAmount;

    public PayoutEligibilityResult check(Event event, PayoutRevenue revenue) {
        if (event.getStatus() != EventStatus.CLOSED) {
            return new PayoutEligibilityResult(false, "error.payout.event-not-closed");
        }

        LocalDateTime holdUntil = event.getEndTime().plusDays(holdDays);
        if (LocalDateTime.now().isBefore(holdUntil)) {
            return new PayoutEligibilityResult(false, "error.payout.hold-period");
        }

        EventPayoutInfo bank = eventPayoutInfoRepository.findByEventId(event.getId()).orElse(null);
        if (bank == null
                || isBlank(bank.getBankName())
                || isBlank(bank.getAccountNumber())
                || isBlank(bank.getAccountHolder())) {
            return new PayoutEligibilityResult(false, "error.payout.bank-info-required");
        }

        if (revenue.netRevenue() < minAmount) {
            return new PayoutEligibilityResult(false, "error.payout.amount-too-low");
        }

        boolean exists = payoutRequestRepository.existsByEventIdAndStatusIn(
                event.getId(), List.of(PayoutStatus.PENDING, PayoutStatus.APPROVED));
        if (exists) {
            return new PayoutEligibilityResult(false, "error.payout.already-exists");
        }

        return new PayoutEligibilityResult(true, null);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
