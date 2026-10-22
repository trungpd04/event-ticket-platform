package com.trungpd.eventticketplatform.orders.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {
    private Long ticketTypeId;
    private String ticketTypeName;
    private Integer quantity;
    private Long unitPrice;
    private Long subtotal;
}
