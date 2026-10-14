package com.trungpd.eventticketplatform.ticketing.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ReserveTicketRequest {

    @NotNull(message = "error.reservation.event-id.required")
    private Long eventId;

    @NotEmpty(message = "error.reservation.items.required")
    @Valid
    private List<ReservationItemRequest> items;

    @Deprecated
    private Integer reservationMinutes = 10;

}
