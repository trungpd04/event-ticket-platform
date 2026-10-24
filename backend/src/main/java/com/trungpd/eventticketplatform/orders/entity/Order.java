package com.trungpd.eventticketplatform.orders.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order extends BaseEntity {

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "promotion_id")
    private Long promotionId;

    @Column(name = "promotion_discount_percent", precision = 5, scale = 2)
    private BigDecimal promotionDiscountPercent;

    @Column(name = "promotion_max_discount")
    private Long promotionMaxDiscount;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    @Column(name = "total_ticket_amount", nullable = false)
    private Long totalTicketAmount = 0L;

    @Column(name = "discount_amount", nullable = false)
    private Long discountAmount = 0L;

    @Column(name = "platform_fee", nullable = false)
    private Long platformFee = 0L;

    @Column(name = "commission_fee", nullable = false)
    private Long commissionFee = 0L;

    @Column(name = "final_amount", nullable = false)
    private Long finalAmount = 0L;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "payment_code")
    private String paymentCode;

    @Column(name = "payment_provider")
    private String paymentProvider;

    @Column(name = "payment_transaction_id")
    private Long paymentTransactionId;

}
