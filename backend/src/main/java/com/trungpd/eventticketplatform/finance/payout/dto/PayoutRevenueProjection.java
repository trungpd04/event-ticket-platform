package com.trungpd.eventticketplatform.finance.payout.dto;

public record PayoutRevenueProjection(
        Long grossTicketAmount,
        Long discountAmount,
        Long platformFee,
        Long commissionFee,
        Long orderCount
) {
}
