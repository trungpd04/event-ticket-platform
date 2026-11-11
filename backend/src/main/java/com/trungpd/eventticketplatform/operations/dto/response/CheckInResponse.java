package com.trungpd.eventticketplatform.operations.dto.response;

import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CheckInResponse {

    private Long ticketId;
    private Long eventId;
    private String eventName;
    private String ticketTypeName;
    private TicketStatus status;
    private LocalDateTime checkedInAt;
}
