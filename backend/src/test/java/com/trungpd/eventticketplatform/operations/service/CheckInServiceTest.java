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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho CheckInService.
 *
 * Luồng check-in:
 * 1. Parse QR để lấy eventId.
 * 2. Verify chữ ký JWT bằng secret của event.
 * 3. Kiểm tra event đang ONGOING.
 * 4. Kiểm tra checker được assign cho event.
 * 5. Load ticket và đối chiếu payload.
 * 6. Kiểm tra trạng thái PAID rồi mark USED.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CheckInServiceTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private TicketTypeRepository ticketTypeRepository;
    @Mock private EventRepository eventRepository;
    @Mock private EventCheckerRepository eventCheckerRepository;
    @Mock private TicketQrService ticketQrService;

    @InjectMocks
    private CheckInService checkInService;

    private static final Long CHECKER_ID = 99L;
    private static final Long EVENT_ID = 1L;
    private static final Long TICKET_ID = 100L;
    private static final Long TICKET_TYPE_ID = 10L;
    private static final Long ORDER_ID = 500L;
    private static final Long ORDER_DETAIL_ID = 1000L;

    private Event event;
    private Ticket ticket;
    private TicketQrPayload payload;
    private CheckInRequest request;

    @BeforeEach
    void setUp() {
        event = new Event();
        event.setId(EVENT_ID);
        event.setTitle("Test Event");
        event.setStatus(EventStatus.ONGOING);
        event.setEndTime(LocalDateTime.now().plusHours(1));

        ticket = new Ticket();
        ticket.setId(TICKET_ID);
        ticket.setEventId(EVENT_ID);
        ticket.setTicketTypeId(TICKET_TYPE_ID);
        ticket.setOrderDetailId(ORDER_DETAIL_ID);
        ticket.setStatus(TicketStatus.PAID);

        payload = new TicketQrPayload(1, TICKET_ID, EVENT_ID, TICKET_TYPE_ID, ORDER_ID, ORDER_DETAIL_ID,
                System.currentTimeMillis() / 1000, System.currentTimeMillis() / 1000 + 3600, "jti-123");

        request = new CheckInRequest();
        request.setQrCode("dummy-jwt-token");
    }

    private void stubValidFlow() {
        when(ticketQrService.parseEventId("dummy-jwt-token")).thenReturn(EVENT_ID);
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(ticketQrService.verify("dummy-jwt-token", event)).thenReturn(payload);
        when(eventCheckerRepository.existsByEventIdAndCheckerId(EVENT_ID, CHECKER_ID)).thenReturn(true);
        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(ticket));
        when(ticketRepository.markUsed(TICKET_ID)).thenReturn(1);
        when(ticketTypeRepository.findById(TICKET_TYPE_ID)).thenReturn(Optional.of(new TicketType()));
    }

    @Test
    void checkIn_shouldSucceed_whenQrValidAndTicketPaid() {
        stubValidFlow();

        CheckInResponse response = checkInService.checkIn(CHECKER_ID, request);

        assertNotNull(response);
        assertEquals(TICKET_ID, response.getTicketId());
        assertEquals(EVENT_ID, response.getEventId());
        assertEquals(TicketStatus.USED, response.getStatus());
        verify(ticketRepository).markUsed(TICKET_ID);
    }

    @Test
    void checkIn_shouldThrow_whenEventNotOngoing() {
        event.setStatus(EventStatus.CLOSED);
        when(ticketQrService.parseEventId("dummy-jwt-token")).thenReturn(EVENT_ID);
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(ticketQrService.verify("dummy-jwt-token", event)).thenReturn(payload);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> checkInService.checkIn(CHECKER_ID, request));

        assertEquals("error.checkin.event-not-ongoing", ex.getMessageKey());
        verify(eventCheckerRepository, never()).existsByEventIdAndCheckerId(any(), any());
    }

    @Test
    void checkIn_shouldThrow_whenCheckerNotAssigned() {
        when(ticketQrService.parseEventId("dummy-jwt-token")).thenReturn(EVENT_ID);
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(ticketQrService.verify("dummy-jwt-token", event)).thenReturn(payload);
        when(eventCheckerRepository.existsByEventIdAndCheckerId(EVENT_ID, CHECKER_ID)).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> checkInService.checkIn(CHECKER_ID, request));

        assertEquals("error.checkin.not-assigned", ex.getMessageKey());
        verify(ticketRepository, never()).findById(any());
    }

    @Test
    void checkIn_shouldThrow_whenQrSignatureInvalid() {
        when(ticketQrService.parseEventId("dummy-jwt-token")).thenReturn(EVENT_ID);
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(ticketQrService.verify("dummy-jwt-token", event))
                .thenThrow(new BusinessException("error.checkin.invalid-signature"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> checkInService.checkIn(CHECKER_ID, request));

        assertEquals("error.checkin.invalid-signature", ex.getMessageKey());
    }

    @Test
    void checkIn_shouldThrow_whenTicketNotFound() {
        stubValidFlow();
        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> checkInService.checkIn(CHECKER_ID, request));
    }

    @Test
    void checkIn_shouldThrow_whenTicketDoesNotMatchPayload() {
        // ticket thuộc event khác so với payload
        ticket.setOrderDetailId(9999L);
        stubValidFlow();

        BusinessException ex = assertThrows(BusinessException.class,
                () -> checkInService.checkIn(CHECKER_ID, request));

        assertEquals("error.checkin.ticket-event-mismatch", ex.getMessageKey());
    }

    @Test
    void checkIn_shouldThrow_whenTicketAlreadyUsed() {
        ticket.setStatus(TicketStatus.USED);
        stubValidFlow();

        BusinessException ex = assertThrows(BusinessException.class,
                () -> checkInService.checkIn(CHECKER_ID, request));

        assertEquals("error.ticket.already-used", ex.getMessageKey());
    }

    @Test
    void checkIn_shouldThrow_whenTicketNotPaid() {
        ticket.setStatus(TicketStatus.RESERVED);
        stubValidFlow();

        BusinessException ex = assertThrows(BusinessException.class,
                () -> checkInService.checkIn(CHECKER_ID, request));

        assertEquals("error.ticket.not-paid", ex.getMessageKey());
    }

    @Test
    void checkIn_shouldThrowAlreadyUsed_whenMarkUsedAffectedZeroRows() {
        stubValidFlow();
        when(ticketRepository.markUsed(TICKET_ID)).thenReturn(0);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> checkInService.checkIn(CHECKER_ID, request));

        assertEquals("error.ticket.already-used", ex.getMessageKey());
    }
}
