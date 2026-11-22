package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.dto.request.PublishedEventUpdateRequest;
import com.trungpd.eventticketplatform.events.dto.request.RejectEventUpdateRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventUpdateRequestResponse;
import com.trungpd.eventticketplatform.events.entity.EventUpdateRequestStatus;
import org.springframework.data.domain.Pageable;

public interface IEventUpdateRequestService {

    EventUpdateRequestResponse createEventUpdateRequest(Long userId, Long eventId, PublishedEventUpdateRequest request);

    PagedResponse<EventUpdateRequestResponse> getEventUpdateRequests(EventUpdateRequestStatus status, Pageable pageable);

    EventUpdateRequestResponse getEventUpdateRequestDetail(Long id);

    EventUpdateRequestResponse approveEventUpdateRequest(Long adminUserId, Long id);

    EventUpdateRequestResponse rejectEventUpdateRequest(Long adminUserId, Long id, RejectEventUpdateRequest request);

}
