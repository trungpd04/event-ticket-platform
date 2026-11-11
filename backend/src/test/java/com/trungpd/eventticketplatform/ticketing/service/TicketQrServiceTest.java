package com.trungpd.eventticketplatform.ticketing.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.ticketing.dto.TicketQrPayload;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit test cho TicketQrService.
 *
 * Cơ chế QR mới: mỗi event có một secret key, QR là JWT HS256 ký bằng secret đó.
 * Payload chứa ticketId, eventId, ticketTypeId, orderId, orderDetailId và exp = event.endTime.
 */
class TicketQrServiceTest {

    private TicketQrService ticketQrService;

    @BeforeEach
    void setUp() {
        ticketQrService = new TicketQrService(new ObjectMapper());
    }

    private Event event(String secretKey, LocalDateTime endTime) {
        Event event = new Event();
        event.setId(1L);
        event.setTitle("Test Event");
        event.setSecretKey(secretKey);
        event.setEndTime(endTime);
        return event;
    }

    private Ticket ticket() {
        Ticket ticket = new Ticket();
        ticket.setId(100L);
        ticket.setEventId(1L);
        ticket.setTicketTypeId(10L);
        ticket.setOrderDetailId(1000L);
        return ticket;
    }

    private Order order() {
        Order order = new Order();
        order.setId(500L);
        order.setEventId(1L);
        return order;
    }

    @Test
    void generateSecretKey_shouldReturnUrlSafeBase64Of32Bytes() {
        String key = ticketQrService.generateSecretKey();

        assertNotNull(key);
        assertFalse(key.isBlank());
        assertFalse(key.contains("="));
        assertEquals(43, key.length()); // 32 bytes -> Base64 URL without padding
    }

    @Test
    void generate_shouldReturnJwt_whenEventHasSecretKey() {
        Event event = event(ticketQrService.generateSecretKey(), LocalDateTime.now().plusHours(2));

        String qr = ticketQrService.generate(ticket(), order(), event);

        assertNotNull(qr);
        assertTrue(qr.startsWith("eyJ")); // JWT compact token always starts with eyJ (Base64 of {"alg":...)
        assertEquals(2, qr.chars().filter(ch -> ch == '.').count());
    }

    @Test
    void generate_shouldThrow_whenEventSecretKeyMissing() {
        Event event = event(null, LocalDateTime.now().plusHours(2));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketQrService.generate(ticket(), order(), event));

        assertEquals("error.event.secret-key-missing", ex.getMessageKey());
    }

    @Test
    void parseEventId_shouldReturnEventId_fromValidQr() {
        Event event = event(ticketQrService.generateSecretKey(), LocalDateTime.now().plusHours(2));
        String qr = ticketQrService.generate(ticket(), order(), event);

        Long eventId = ticketQrService.parseEventId(qr);

        assertEquals(event.getId(), eventId);
    }

    @Test
    void parseEventId_shouldThrow_whenQrMalformed() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketQrService.parseEventId("not-a-jwt"));

        assertEquals("error.checkin.invalid-qr", ex.getMessageKey());
    }

    @Test
    void verify_shouldReturnPayload_whenSignatureValid() {
        Event event = event(ticketQrService.generateSecretKey(), LocalDateTime.now().plusHours(2));
        String qr = ticketQrService.generate(ticket(), order(), event);

        TicketQrPayload payload = ticketQrService.verify(qr, event);

        assertNotNull(payload);
        assertEquals(1, payload.v());
        assertEquals(ticket().getId(), payload.ticketId());
        assertEquals(event.getId(), payload.eventId());
        assertEquals(ticket().getTicketTypeId(), payload.ticketTypeId());
        assertEquals(order().getId(), payload.orderId());
        assertEquals(ticket().getOrderDetailId(), payload.orderDetailId());
    }

    @Test
    void verify_shouldThrowInvalidSignature_whenSignedWithDifferentKey() {
        Event eventA = event(ticketQrService.generateSecretKey(), LocalDateTime.now().plusHours(2));
        Event eventB = event(ticketQrService.generateSecretKey(), LocalDateTime.now().plusHours(2));
        String qr = ticketQrService.generate(ticket(), order(), eventA);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketQrService.verify(qr, eventB));

        assertEquals("error.checkin.invalid-signature", ex.getMessageKey());
    }

    @Test
    void verify_shouldThrow_whenQrExpired() {
        // Event đã kết thúc -> QR có exp trong quá khứ
        Event event = event(ticketQrService.generateSecretKey(), LocalDateTime.now().minusMinutes(1));
        String qr = ticketQrService.generate(ticket(), order(), event);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketQrService.verify(qr, event));

        assertEquals("error.checkin.event-not-ongoing", ex.getMessageKey());
    }

    @Test
    void verify_shouldThrowInvalidSignature_whenPayloadTampered() {
        Event event = event(ticketQrService.generateSecretKey(), LocalDateTime.now().plusHours(2));
        String qr = ticketQrService.generate(ticket(), order(), event);
        String tampered = qr.substring(0, qr.length() - 5) + "XXXXX";

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketQrService.verify(tampered, event));

        assertEquals("error.checkin.invalid-signature", ex.getMessageKey());
    }
}
