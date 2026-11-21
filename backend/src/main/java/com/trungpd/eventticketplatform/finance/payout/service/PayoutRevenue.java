package com.trungpd.eventticketplatform.finance.payout.service;

public record PayoutRevenue(
        int orderCount,
        long grossTicketAmount,
        long discountAmount,
        long grossRevenue,
        long platformFee,
        long commissionFee,
        long netRevenue
) {
}
