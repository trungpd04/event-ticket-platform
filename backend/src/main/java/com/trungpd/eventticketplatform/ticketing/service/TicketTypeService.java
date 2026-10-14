package com.trungpd.eventticketplatform.ticketing.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.UserService;
import com.trungpd.eventticketplatform.ticketing.dto.request.CreateTicketTypeRequest;
import com.trungpd.eventticketplatform.ticketing.dto.response.TicketTypeResponse;
import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import com.trungpd.eventticketplatform.ticketing.mapper.TicketTypeMapper;
import com.trungpd.eventticketplatform.ticketing.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketTypeService {

    private final TicketTypeRepository ticketTypeRepository;
    private final TicketTypeMapper ticketTypeMapper;
    private final EventRepository eventRepository;
    private final UserService userService;

    @Transactional
    public TicketTypeResponse createTicketType(String email, Long eventId, CreateTicketTypeRequest request) {
        User user = userService.findByEmail(email);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        if (!event.getOrganizerId().equals(user.getId())) {
            throw new BusinessException("error.event.not-owner");
        }

        if (event.getStatus() != EventStatus.PENDING) {
            throw new BusinessException("error.event.not-editable");
        }

        boolean duplicate = ticketTypeRepository.findByEventId(eventId).stream()
                .anyMatch(existing -> existing.getName().trim().equalsIgnoreCase(request.getName().trim()));
        if (duplicate) {
            throw new BusinessException("error.event.ticket-types.duplicate-name");
        }

        validateTicketTypeLimits(request);
        TicketType ticketType = ticketTypeMapper.toEntity(request);
        ticketType.setEventId(eventId);
        ticketType.setAvailableQuantity(request.getTotalQuantity());
        if (ticketType.getMinPerOrder() == null) {
            ticketType.setMinPerOrder(1);
        }
        if (ticketType.getMaxPerOrder() == null) {
            ticketType.setMaxPerOrder(request.getTotalQuantity());
        }

        TicketType saved = ticketTypeRepository.save(ticketType);
        return ticketTypeMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketTypeResponse> findPublicByEventId(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessException("error.event.not-published");
        }
        return findByEventId(eventId);
    }

    @Transactional(readOnly = true)
    public List<TicketTypeResponse> findOrganizerTicketTypes(String email, Long eventId) {
        User user = userService.findByEmail(email);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));
        if (!event.getOrganizerId().equals(user.getId())) {
            throw new BusinessException("error.event.not-owner");
        }
        return findByEventId(eventId);
    }

    private List<TicketTypeResponse> findByEventId(Long eventId) {
        return ticketTypeRepository.findByEventId(eventId).stream()
                .map(ticketTypeMapper::toResponse)
                .toList();
    }

    private void validateTicketTypeLimits(CreateTicketTypeRequest request) {
        int minPerOrder = request.getMinPerOrder() == null ? 1 : request.getMinPerOrder();
        int maxPerOrder = request.getMaxPerOrder() == null
                ? request.getTotalQuantity()
                : request.getMaxPerOrder();
        if (minPerOrder > maxPerOrder || maxPerOrder > request.getTotalQuantity()) {
            throw new BusinessException("error.ticket-type.order-limit.invalid");
        }
    }

}
