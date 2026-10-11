package com.trungpd.eventticketplatform.ticketing.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ReservationItemResponse {

    private Long ticketTypeId;
    private String ticketTypeName;
    private Integer quantity;
    private Long unitPrice;
    private Long subtotal;
    private List<Long> ticketIds;

}
