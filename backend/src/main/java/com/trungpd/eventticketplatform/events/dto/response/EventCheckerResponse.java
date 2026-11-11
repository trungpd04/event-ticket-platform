package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventCheckerResponse {

    private Long id;
    private Long eventId;
    private Long checkerId;
    private String checkerEmail;
    private String checkerFullName;
    private LocalDateTime createdAt;
}
