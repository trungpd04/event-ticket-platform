package com.trungpd.eventticketplatform.orders.dto.response;

import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MockPaymentResponse {
    private Long orderId;
    private OrderStatus status;
    private LocalDateTime paidAt;
    private Long finalAmount;
    private String message;
}
