package com.trungpd.eventticketplatform.orders.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderTicketResponse {
    private Long id;
    private Long ticketTypeId;
    private String ticketTypeName;
    private String qrCode;
}
