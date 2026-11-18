package com.trungpd.eventticketplatform.orders.job;

import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import com.trungpd.eventticketplatform.orders.service.IOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class JobReleaseTicketWhenOrderExpired {

    private final OrderRepository orderRepository;
    private final IOrderService orderService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expirePendingOrders() {
        LocalDateTime now = LocalDateTime.now();
        orderRepository.findByStatusAndExpiredAtBefore(OrderStatus.PENDING_PAYMENT, now)
                .forEach(order -> orderService.expireIfPending(order.getId(), now));
    }
}
