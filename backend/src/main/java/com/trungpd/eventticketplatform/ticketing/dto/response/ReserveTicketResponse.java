package com.trungpd.eventticketplatform.ticketing.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReserveTicketResponse {

    private String reservationId;
    private LocalDateTime reservedUntil;
    private List<ReservationItemResponse> items;
    private Long totalAmount;

}
