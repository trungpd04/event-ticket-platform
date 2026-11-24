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
        Object[] result = orderRepository.sumRevenueByEventIdAndStatus(eventId, OrderStatus.PAID)
                .orElse(new Object[]{0L, 0L, 0L, 0L, 0L});

        long grossTicketAmount = toLong(unwrap(result[0]));
        long discountAmount = toLong(unwrap(result[1]));
        long platformFee = toLong(unwrap(result[2]));
        long commissionFee = toLong(unwrap(result[3]));
        int orderCount = toInt(unwrap(result[4]));

        long grossRevenue = grossTicketAmount - discountAmount;
        long netRevenue = grossRevenue - commissionFee;

        return new PayoutRevenue(orderCount, grossTicketAmount, discountAmount, grossRevenue,
                platformFee, commissionFee, netRevenue);
    }

    private Object unwrap(Object value) {
        if (value instanceof Object[] array && array.length == 1) {
            return array[0];
        }
        return value;
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
