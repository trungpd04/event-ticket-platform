package com.trungpd.eventticketplatform.ticketing.dto;

public record TicketQrPayload(
        Integer v,
        Long ticketId,
        Long eventId,
        Long ticketTypeId,
        Long orderId,
        Long orderDetailId,
        Long issuedAt,
        Long expiration,
        String jti
) {
}
