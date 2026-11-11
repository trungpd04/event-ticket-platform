package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.request.AssignCheckerRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventCheckerResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;

import java.util.List;

public interface IEventCheckerService {

    EventCheckerResponse assignChecker(Long eventId, AssignCheckerRequest request);

    void removeChecker(Long eventId, Long checkerId);

    List<EventCheckerResponse> findCheckersByEvent(Long eventId);

    List<EventResponse> findAssignedEvents(Long checkerId);
}
