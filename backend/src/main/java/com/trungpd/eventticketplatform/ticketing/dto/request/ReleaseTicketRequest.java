package com.trungpd.eventticketplatform.ticketing.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReleaseTicketRequest {

    @NotBlank(message = "error.reservation.reservation-id.required")
    private String reservationId;

}
