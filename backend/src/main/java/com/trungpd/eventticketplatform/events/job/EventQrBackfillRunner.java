package com.trungpd.eventticketplatform.events.job;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.entity.OrderDetail;
import com.trungpd.eventticketplatform.orders.repository.OrderDetailRepository;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import com.trungpd.eventticketplatform.ticketing.repository.TicketRepository;
import com.trungpd.eventticketplatform.ticketing.service.TicketQrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventQrBackfillRunner implements ApplicationRunner {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final TicketQrService ticketQrService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        backfillEventSecretKeys();
        backfillTicketQrCodes();
    }

    private void backfillEventSecretKeys() {
        List<Event> events = eventRepository.findBySecretKeyIsNullAndStatusIn(
                List.of(EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.CLOSED));
        if (events.isEmpty()) {
            return;
        }

        events.forEach(event -> event.setSecretKey(ticketQrService.generateSecretKey()));
        eventRepository.saveAll(events);

        log.info("Backfilled secret keys for {} event(s)", events.size());
    }

    private void backfillTicketQrCodes() {
        List<Ticket> tickets = ticketRepository.findPaidTicketsWithLegacyQr(TicketStatus.PAID, "eyJ%");
        if (tickets.isEmpty()) {
            return;
        }

        int regenerated = 0;
        for (Ticket ticket : tickets) {
            OrderDetail orderDetail = ticket.getOrderDetailId() != null
                    ? orderDetailRepository.findById(ticket.getOrderDetailId()).orElse(null)
                    : null;
            if (orderDetail == null) {
                continue;
            }

            Order order = orderRepository.findById(orderDetail.getOrderId()).orElse(null);
            if (order == null) {
                continue;
            }

            Event event = eventRepository.findById(ticket.getEventId()).orElse(null);
            if (event == null || event.getSecretKey() == null) {
                continue;
            }

            ticket.setQrCode(ticketQrService.generate(ticket, order, event));
            regenerated++;
        }

        ticketRepository.saveAll(tickets);
        log.info("Regenerated QR codes for {} paid ticket(s)", regenerated);
    }
}
