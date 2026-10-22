package com.trungpd.eventticketplatform.orders.repository;

import com.trungpd.eventticketplatform.orders.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
    Page<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status, Pageable pageable);
    List<Order> findByStatusAndExpiredAtBefore(OrderStatus status, java.time.LocalDateTime expiredAt);

}
