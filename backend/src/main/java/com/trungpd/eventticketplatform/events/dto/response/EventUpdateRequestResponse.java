package com.trungpd.eventticketplatform.events.dto.response;

import com.trungpd.eventticketplatform.events.dto.request.PublishedEventUpdateRequest;
import com.trungpd.eventticketplatform.events.entity.EventUpdateRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventUpdateRequestResponse {

    private Long id;
    private Long eventId;
    private String eventTitle;
    private Long organizerId;
    private String organizerEmail;
    private PublishedEventUpdateRequest payload;
    private EventUpdateRequestStatus status;
    private String rejectionReason;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
