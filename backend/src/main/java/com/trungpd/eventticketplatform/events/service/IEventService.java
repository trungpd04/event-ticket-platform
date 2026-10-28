package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.dto.request.CreateEventRequest;
import com.trungpd.eventticketplatform.events.dto.request.UpdateEventFeePolicyRequest;
import com.trungpd.eventticketplatform.events.dto.request.UpdateEventRequest;
import com.trungpd.eventticketplatform.events.dto.request.UpdateEventStatusRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventDetailResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.enums.TimeFilter;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface IEventService {

    EventResponse createEvent(Long userId, CreateEventRequest request);

    PagedResponse<EventResponse> searchEvents(String title, String location,
                                              LocalDateTime fromDate, LocalDateTime toDate,
                                              EventStatus status, TimeFilter timeFilter,
                                              Long categoryId, Long provinceId,
                                              Pageable pageable);

    PagedResponse<EventResponse> searchAdminEvents(String title, Long categoryId, Long provinceId,
                                                   EventStatus status, TimeFilter timeFilter,
                                                   Pageable pageable);

    EventDetailResponse getEventDetail(Long id);

    EventDetailResponse getAdminEventDetail(Long id);

    EventResponse updateEvent(Long userId, Long id, UpdateEventRequest request);

    EventResponse requestPublish(Long userId, Long id);

    EventResponse updateEventFeePolicy(Long id, UpdateEventFeePolicyRequest request);

    EventResponse publishEvent(Long id);

    EventResponse closeEvent(Long id);

    EventResponse updateEventStatus(Long id, UpdateEventStatusRequest request);

    PagedResponse<EventResponse> getOrganizerEvents(Long userId, Pageable pageable);

    Event findEventById(Long id);

    EventResponse enrichEventResponse(EventResponse response);
}
