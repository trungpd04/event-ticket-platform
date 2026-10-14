package com.trungpd.eventticketplatform.ticketing.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketTypeRequest {

    @NotBlank(message = "{error.ticket-type.name.required}")
    private String name;

    private String description;

    @NotNull(message = "{error.ticket-type.price.required}")
    @Min(value = 0, message = "{error.ticket-type.price.min}")
    private Long price;

    @NotNull(message = "{error.ticket-type.total-quantity.required}")
    @Min(value = 1, message = "{error.ticket-type.total-quantity.min}")
    private Integer totalQuantity;

    @Min(value = 1, message = "{error.ticket-type.min-per-order.min}")
    private Integer minPerOrder = 1;

    @Min(value = 1, message = "{error.ticket-type.max-per-order.min}")
    private Integer maxPerOrder;

}
