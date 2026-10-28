package com.trungpd.eventticketplatform.finance.payment;

import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PaymentStatusResponse {

    private Long orderId;
    private OrderStatus status;
    private LocalDateTime paidAt;
}
