package com.trungpd.eventticketplatform.orders.dto.response;

import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private Long customerId;
    private Long eventId;
    private OrderStatus status;
    private Long totalTicketAmount;
    private Long discountAmount;
    private Long platformFee;
    private Long commissionFee;
    private Long finalAmount;
    private LocalDateTime paidAt;
    private LocalDateTime expiredAt;
    private List<OrderItemResponse> items;
}
