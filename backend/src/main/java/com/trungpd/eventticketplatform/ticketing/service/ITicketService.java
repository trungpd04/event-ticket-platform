package com.trungpd.eventticketplatform.ticketing.service;

import com.trungpd.eventticketplatform.ticketing.dto.request.ReserveTicketRequest;
import com.trungpd.eventticketplatform.ticketing.dto.response.ReserveTicketResponse;
import com.trungpd.eventticketplatform.ticketing.dto.response.TicketStatusResponse;

public interface ITicketService {

    void materializeWarmBatch(Long eventId);

    void closeTicketSales(Long eventId);

    ReserveTicketResponse reserveTickets(Long userId, ReserveTicketRequest request);

    void releaseTickets(Long userId, String reservationId);

    TicketStatusResponse getTicketStatus(Long ticketId);
}
