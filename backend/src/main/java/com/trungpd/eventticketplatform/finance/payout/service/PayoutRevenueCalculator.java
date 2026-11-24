package com.trungpd.eventticketplatform.finance.payout.service;

import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PayoutRevenueCalculator {

    private final OrderRepository orderRepository;

    public PayoutRevenue calculate(Long eventId) {
        Object[] result = orderRepository.sumRevenueByEventIdAndStatus(eventId, OrderStatus.PAID);

        long grossTicketAmount = toLong(result[0]);
        long discountAmount = toLong(result[1]);
        long platformFee = toLong(result[2]);
        long commissionFee = toLong(result[3]);
        int orderCount = toInt(result[4]);

        long grossRevenue = grossTicketAmount - discountAmount;
        long netRevenue = grossRevenue - commissionFee;

        return new PayoutRevenue(orderCount, grossTicketAmount, discountAmount, grossRevenue,
                platformFee, commissionFee, netRevenue);
    }

    private long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number number) return number.longValue();
        return Long.parseLong(value.toString());
    }

    private int toInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Number number) return number.intValue();
        return Integer.parseInt(value.toString());
    }
}
