package com.trungpd.eventticketplatform.ticketing.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketTypeResponse {

    private Long id;
    private String name;
    private String description;
    private Long price;
    private Integer totalQuantity;
    private Integer availableQuantity;

}
