package com.trungpd.eventticketplatform.ticketing.dto.response;

import com.fasterxml.jackson.annotation.JsonView;
import com.trungpd.eventticketplatform.common.response.ResponseViews;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketTypeResponse {

    private Long id;
    private String name;
    private String description;
    private Long price;
    @JsonView(ResponseViews.Admin.class)
    private Integer totalQuantity;
    @JsonView(ResponseViews.Admin.class)
    private Integer availableQuantity;
    private Integer minPerOrder;
    private Integer maxPerOrder;

}
