package com.trungpd.eventticketplatform.ticketing.dto.response;

import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketStatusResponse {

    private Long ticketId;
    private TicketStatus status;
    private LocalDateTime reservedUntil;

}
