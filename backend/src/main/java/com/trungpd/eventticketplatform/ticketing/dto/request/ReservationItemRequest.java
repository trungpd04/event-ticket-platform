package com.trungpd.eventticketplatform.ticketing.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservationItemRequest {

    @NotNull(message = "error.reservation.item.ticket-type-id.required")
    private Long ticketTypeId;

    @NotNull(message = "error.reservation.item.quantity.required")
    @Min(value = 1, message = "error.reservation.item.quantity.min")
    private Integer quantity;

}
