package com.trungpd.eventticketplatform.orders.job;

import com.trungpd.eventticketplatform.events.repository.PromotionRepository;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.entity.OrderDetail;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderDetailRepository;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import com.trungpd.eventticketplatform.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JobReleaseTicketWhenOrderExpired {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final TicketRepository ticketRepository;
    private final PromotionRepository promotionRepository;

//    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expirePendingOrders() {
        orderRepository.findByStatusAndExpiredAtBefore(OrderStatus.PENDING_PAYMENT, LocalDateTime.now())
                .forEach(order -> {
                    release(order);
                    order.setStatus(OrderStatus.EXPIRED);
                    orderRepository.save(order);
                });
    }

    private void release(Order order) {
        List<Long> ids = orderDetailRepository.findByOrderId(order.getId()).stream()
                .map(OrderDetail::getId)
                .toList();
        if (!ids.isEmpty()) {
            ticketRepository.releaseTicketsByOrderDetailIds(ids);
        }
        if (order.getPromotionId() != null) {
            promotionRepository.decrementUsedCount(order.getPromotionId());
        }
    }
}
