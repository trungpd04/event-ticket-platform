package com.trungpd.eventticketplatform.ticketing.service;

import com.trungpd.eventticketplatform.ticketing.dto.request.CreateTicketTypeRequest;
import com.trungpd.eventticketplatform.ticketing.dto.response.TicketTypeResponse;

import java.util.List;

public interface ITicketTypeService {

    TicketTypeResponse createTicketType(Long userId, Long eventId, CreateTicketTypeRequest request);

    List<TicketTypeResponse> findPublicByEventId(Long eventId);

    List<TicketTypeResponse> findOrganizerTicketTypes(Long userId, Long eventId);
}
