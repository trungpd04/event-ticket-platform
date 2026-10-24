package com.trungpd.eventticketplatform.orders.repository;

import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    Optional<Order> findByPaymentCode(String paymentCode);

    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    Page<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status, Pageable pageable);

    List<Order> findByStatusAndExpiredAtBefore(OrderStatus status, LocalDateTime expiredAt);

    @Modifying
    @Query("""
            UPDATE Order o
            SET o.status = com.trungpd.eventticketplatform.orders.enums.OrderStatus.PAID,
                o.paidAt = :paidAt,
                o.paymentTransactionId = :transactionId
            WHERE o.id = :orderId
              AND o.status = com.trungpd.eventticketplatform.orders.enums.OrderStatus.PENDING_PAYMENT
              AND o.finalAmount = :amount
            """)
    int markPaidIfPending(
            @Param("orderId") Long orderId,
            @Param("transactionId") Long transactionId,
            @Param("amount") Long amount,
            @Param("paidAt") LocalDateTime paidAt);
}
