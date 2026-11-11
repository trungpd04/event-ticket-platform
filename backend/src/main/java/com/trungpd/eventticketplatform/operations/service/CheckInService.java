package com.trungpd.eventticketplatform.operations.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.repository.EventCheckerRepository;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.operations.dto.request.CheckInRequest;
import com.trungpd.eventticketplatform.operations.dto.response.CheckInResponse;
import com.trungpd.eventticketplatform.ticketing.dto.TicketQrPayload;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import com.trungpd.eventticketplatform.ticketing.repository.TicketRepository;
import com.trungpd.eventticketplatform.ticketing.repository.TicketTypeRepository;
import com.trungpd.eventticketplatform.ticketing.service.TicketQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CheckInService implements ICheckInService {

    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final EventRepository eventRepository;
    private final EventCheckerRepository eventCheckerRepository;
    private final TicketQrService ticketQrService;

    @Override
    @Transactional
    public CheckInResponse checkIn(Long checkerUserId, CheckInRequest request) {
        String token = request.getQrCode();

        Long eventId = ticketQrService.parseEventId(token);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        TicketQrPayload payload = ticketQrService.verify(token, event);

        if (event.getStatus() != EventStatus.ONGOING) {
            throw new BusinessException("error.checkin.event-not-ongoing");
        }

        if (!eventCheckerRepository.existsByEventIdAndCheckerId(eventId, checkerUserId)) {
            throw new BusinessException("error.checkin.not-assigned");
        }

        Ticket ticket = ticketRepository.findById(payload.ticketId())
                .orElseThrow(() -> new NotFoundException("error.ticket.not-found"));

        validateTicketMatchesPayload(ticket, payload, eventId);

        if (ticket.getStatus() == TicketStatus.USED) {
            throw new BusinessException("error.ticket.already-used");
        }

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessException("error.ticket.not-paid");
        }

        int updated = ticketRepository.markUsed(ticket.getId());
        if (updated == 0) {
            throw new BusinessException("error.ticket.already-used");
        }

        ticket.setStatus(TicketStatus.USED);

        TicketType ticketType = ticketTypeRepository.findById(ticket.getTicketTypeId())
                .orElse(null);

        return CheckInResponse.builder()
                .ticketId(ticket.getId())
                .eventId(event.getId())
                .eventName(event.getTitle())
                .ticketTypeName(ticketType != null ? ticketType.getName() : null)
                .status(TicketStatus.USED)
                .checkedInAt(LocalDateTime.now())
                .build();
    }

    private void validateTicketMatchesPayload(Ticket ticket, TicketQrPayload payload, Long eventId) {
        if (!Objects.equals(ticket.getEventId(), eventId)
                || !Objects.equals(ticket.getEventId(), payload.eventId())
                || !Objects.equals(ticket.getTicketTypeId(), payload.ticketTypeId())
                || !Objects.equals(ticket.getOrderDetailId(), payload.orderDetailId())) {
            throw new BusinessException("error.checkin.ticket-event-mismatch");
        }
    }
}
