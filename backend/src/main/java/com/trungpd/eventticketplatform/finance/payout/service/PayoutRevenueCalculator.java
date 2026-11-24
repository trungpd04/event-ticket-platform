package com.trungpd.eventticketplatform.finance.payout.service;

import com.trungpd.eventticketplatform.finance.payout.dto.PayoutRevenueProjection;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PayoutRevenueCalculator {

    private final OrderRepository orderRepository;

    public PayoutRevenue calculate(Long eventId) {
        PayoutRevenueProjection projection = orderRepository.sumRevenueByEventIdAndStatus(eventId, OrderStatus.PAID)
                .orElse(new PayoutRevenueProjection(0L, 0L, 0L, 0L, 0L));

        long grossTicketAmount = toLong(projection.grossTicketAmount());
        long discountAmount = toLong(projection.discountAmount());
        long platformFee = toLong(projection.platformFee());
        long commissionFee = toLong(projection.commissionFee());
        int orderCount = toInt(projection.orderCount());

        long grossRevenue = grossTicketAmount - discountAmount;
        long netRevenue = grossRevenue - commissionFee;

        return new PayoutRevenue(orderCount, grossTicketAmount, discountAmount, grossRevenue,
                platformFee, commissionFee, netRevenue);
    }

    private long toLong(Number value) {
        return value == null ? 0L : value.longValue();
    }

    private int toInt(Number value) {
        return value == null ? 0 : value.intValue();
    }
}
