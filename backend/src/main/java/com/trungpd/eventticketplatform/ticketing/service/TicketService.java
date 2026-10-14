package com.trungpd.eventticketplatform.ticketing.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
import com.trungpd.eventticketplatform.events.repository.OptionSetValueRepository;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.UserService;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.entity.OrderDetail;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderDetailRepository;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import com.trungpd.eventticketplatform.ticketing.dto.request.ReserveTicketRequest;
import com.trungpd.eventticketplatform.ticketing.dto.request.ReservationItemRequest;
import com.trungpd.eventticketplatform.ticketing.dto.response.ReservationItemResponse;
import com.trungpd.eventticketplatform.ticketing.dto.response.ReserveTicketResponse;
import com.trungpd.eventticketplatform.ticketing.dto.response.TicketStatusResponse;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import com.trungpd.eventticketplatform.ticketing.repository.TicketRepository;
import com.trungpd.eventticketplatform.ticketing.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final EventRepository eventRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final UserService userService;
    private final OptionSetValueRepository optionSetValueRepository;

    private static final int BATCH_SIZE = 1000;

    @Transactional
    public void preAllocateTickets(Long eventId) {
        List<TicketType> ticketTypes = ticketTypeRepository.findByEventId(eventId);
        if (ticketTypes.isEmpty()) {
            log.warn("No ticket types found for event {}. Skipping pre-allocation.", eventId);
            return;
        }

        for (TicketType ticketType : ticketTypes) {
            int total = ticketType.getTotalQuantity();
            if (total <= 0) {
                continue;
            }

            List<Ticket> batch = new ArrayList<>(Math.min(total, BATCH_SIZE));
            for (int i = 0; i < total; i++) {
                Ticket ticket = new Ticket();
                ticket.setTicketTypeId(ticketType.getId());
                ticket.setEventId(eventId);
                ticket.setStatus(TicketStatus.AVAILABLE);
                batch.add(ticket);

                if (batch.size() == BATCH_SIZE) {
                    ticketRepository.saveAll(batch);
                    batch.clear();
                }
            }
            if (!batch.isEmpty()) {
                ticketRepository.saveAll(batch);
            }
            log.info("Pre-allocated {} tickets for ticket type {}", total, ticketType.getId());
        }
    }

    @Transactional
    public void closeTicketSales(Long eventId) {
        log.info("Closing ticket sales for event {}", eventId);
    }

    @Transactional
    public ReserveTicketResponse reserveTickets(String email, ReserveTicketRequest request) {
        User user = userService.findByEmail(email);
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        validateEventForReservation(event);

        LocalDateTime now = LocalDateTime.now();
        int reservationMinutes = getReservationMinutes();
        LocalDateTime reservedUntil = now.plusMinutes(reservationMinutes);

        String orderCode = generateReservationCode();
        Order order = new Order();
        order.setCustomerId(user.getId());
        order.setEventId(event.getId());
        order.setOrderCode(orderCode);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setExpiredAt(reservedUntil);
        order = orderRepository.save(order);

        List<OrderDetail> orderDetails = new ArrayList<>();
        List<ReservationItemResponse> itemResponses = new ArrayList<>();
        long totalAmount = 0;

        for (ReservationItemRequest item : request.getItems()) {
            TicketType ticketType = ticketTypeRepository.findById(item.getTicketTypeId())
                    .orElseThrow(() -> new NotFoundException("error.ticket-type.not-found"));

            if (!ticketType.getEventId().equals(event.getId())) {
                throw new BusinessException("error.ticket-type.not-in-event");
            }

            int quantity = item.getQuantity();
            int minPerOrder = ticketType.getMinPerOrder() == null ? 1 : ticketType.getMinPerOrder();
            int maxPerOrder = ticketType.getMaxPerOrder() == null
                    ? ticketType.getTotalQuantity()
                    : ticketType.getMaxPerOrder();
            if (quantity < minPerOrder || quantity > maxPerOrder) {
                throw new BusinessException("error.ticket-type.order-limit.invalid");
            }
            long subtotal = ticketType.getPrice() * quantity;

            OrderDetail detail = new OrderDetail();
            detail.setOrderId(order.getId());
            detail.setTicketTypeId(ticketType.getId());
            detail.setQuantity(quantity);
            detail.setUnitPrice(ticketType.getPrice());
            detail.setSubtotal(subtotal);
            orderDetails.add(detail);

            totalAmount += subtotal;
        }

        orderDetails = orderDetailRepository.saveAll(orderDetails);

        for (int i = 0; i < request.getItems().size(); i++) {
            ReservationItemRequest item = request.getItems().get(i);
            OrderDetail detail = orderDetails.get(i);
            TicketType ticketType = ticketTypeRepository.findById(item.getTicketTypeId()).orElseThrow();

            List<Ticket> reserved = ticketRepository.reserveTickets(
                    ticketType.getId(),
                    event.getId(),
                    item.getQuantity(),
                    reservedUntil,
                    detail.getId()
            );

            if (reserved.size() < item.getQuantity()) {
                throw new BusinessException("error.ticket.not-enough",
                        new Object[]{ticketType.getName()});
            }

            List<Long> ticketIds = reserved.stream()
                    .map(Ticket::getId)
                    .toList();

            itemResponses.add(ReservationItemResponse.builder()
                    .ticketTypeId(ticketType.getId())
                    .ticketTypeName(ticketType.getName())
                    .quantity(reserved.size())
                    .unitPrice(ticketType.getPrice())
                    .subtotal(ticketType.getPrice() * reserved.size())
                    .ticketIds(ticketIds)
                    .build());
        }

        order.setTotalTicketAmount(totalAmount);
        order.setFinalAmount(totalAmount);
        orderRepository.save(order);

        return ReserveTicketResponse.builder()
                .reservationId(orderCode)
                .reservedUntil(reservedUntil)
                .items(itemResponses)
                .totalAmount(totalAmount)
                .build();
    }

    @Transactional
    public void releaseTickets(String email, String reservationId) {
        User user = userService.findByEmail(email);
        Order order = orderRepository.findByOrderCode(reservationId)
                .orElseThrow(() -> new NotFoundException("error.order.not-found"));

        if (!order.getCustomerId().equals(user.getId())) {
            throw new BusinessException("error.order.not-owner");
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessException("error.order.cannot-release");
        }

        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());
        for (OrderDetail detail : details) {
            int released = ticketRepository.releaseTicketsByOrderDetailId(detail.getId());
            log.debug("Released {} tickets for order detail {}", released, detail.getId());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public TicketStatusResponse getTicketStatus(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NotFoundException("error.ticket.not-found"));

        return TicketStatusResponse.builder()
                .ticketId(ticket.getId())
                .status(ticket.getStatus())
                .reservedUntil(ticket.getReservedUntil())
                .build();
    }

    private void validateEventForReservation(Event event) {
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessException("error.event.not-published");
        }

        LocalDateTime now = LocalDateTime.now();
        if (event.getTicketSaleStartTime() != null && now.isBefore(event.getTicketSaleStartTime())) {
            throw new BusinessException("error.event.sale-not-started");
        }
        if (event.getTicketSaleEndTime() != null && now.isAfter(event.getTicketSaleEndTime())) {
            throw new BusinessException("error.event.sale-ended");
        }
    }

    private int getReservationMinutes() {
        OptionSetValue setting = optionSetValueRepository
                .findByOptionSetCodeAndCode("RESERVATION_CONFIG", "RESERVATION_MINUTES")
                .orElseThrow(() -> new BusinessException("error.reservation.minutes.config-missing"));
        if (!"ACTIVE".equalsIgnoreCase(setting.getStatus())) {
            throw new BusinessException("error.reservation.minutes.config-invalid");
        }

        try {
            int minutes = Integer.parseInt(setting.getValue());
            if (minutes < 1) {
                throw new NumberFormatException("must be positive");
            }
            return minutes;
        } catch (NumberFormatException exception) {
            throw new BusinessException("error.reservation.minutes.config-invalid");
        }
    }

    private String generateReservationCode() {
        return "RES-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

}
