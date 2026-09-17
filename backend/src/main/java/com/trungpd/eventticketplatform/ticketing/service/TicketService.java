package com.trungpd.eventticketplatform.ticketing.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TicketService {

    public void preAllocateTickets(Long eventId) {
        log.info("Pre-allocating tickets for event {} (Phase 3 implementation)", eventId);
    }

    public void closeTicketSales(Long eventId) {
        log.info("Closing ticket sales for event {} (Phase 3 implementation)", eventId);
    }

}
