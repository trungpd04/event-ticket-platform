package com.trungpd.eventticketplatform.ticketing.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
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

    @NotNull(message = "error.reservation.minutes.required")
    @Min(value = 1, message = "error.reservation.minutes.min")
    private Integer reservationMinutes = 10;

}
