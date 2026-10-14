package com.trungpd.eventticketplatform.ticketing.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
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
import com.trungpd.eventticketplatform.ticketing.dto.response.ReserveTicketResponse;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import com.trungpd.eventticketplatform.ticketing.repository.TicketPoolJdbcDao;
import com.trungpd.eventticketplatform.ticketing.repository.TicketRepository;
import com.trungpd.eventticketplatform.ticketing.repository.TicketTypeRepository;
import com.trungpd.eventticketplatform.events.repository.OptionSetValueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceRefillTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private TicketTypeRepository ticketTypeRepository;
    @Mock
    private TicketPoolJdbcDao ticketPoolJdbcDao;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderDetailRepository orderDetailRepository;
    @Mock
    private UserService userService;
    @Mock
    private OptionSetValueRepository optionSetValueRepository;

    @InjectMocks
    private TicketService ticketService;

    private User user;
    private Event event;
    private TicketType ticketType;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(ticketService, "poolBatchSize", 500);
        ReflectionTestUtils.setField(ticketService, "poolWarmSize", 100);

        user = new User();
        user.setId(1L);

        event = new Event();
        event.setId(1L);
        event.setStatus(EventStatus.PUBLISHED);

        OptionSetValue reservationMinutes = new OptionSetValue();
        reservationMinutes.setValue("10");
        when(optionSetValueRepository.findByOptionSetCodeAndCode(
                "RESERVATION_CONFIG", "RESERVATION_MINUTES"))
                .thenReturn(Optional.of(reservationMinutes));

        ticketType = new TicketType();
        ticketType.setId(10L);
        ticketType.setEventId(1L);
        ticketType.setName("Vé A");
        ticketType.setPrice(100000L);
        ticketType.setTotalQuantity(1000);
        ticketType.setAvailableQuantity(900);
    }

    private ReserveTicketRequest request(int quantity) {
        ReservationItemRequest item = new ReservationItemRequest();
        item.setTicketTypeId(10L);
        item.setQuantity(quantity);

        ReserveTicketRequest request = new ReserveTicketRequest();
        request.setEventId(1L);
        request.setReservationMinutes(10);
        request.setItems(List.of(item));
        return request;
    }

    private void stubOrderFlow() {
        Order order = new Order();
        order.setId(100L);
        order.setStatus(OrderStatus.PENDING_PAYMENT);

        OrderDetail detail = new OrderDetail();
        detail.setId(200L);

        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderDetailRepository.saveAll(anyList())).thenReturn(List.of(detail));
    }

    private Ticket ticket(long id) {
        Ticket ticket = new Ticket();
        ticket.setId(id);
        ticket.setTicketTypeId(10L);
        ticket.setEventId(1L);
        ticket.setStatus(TicketStatus.RESERVED);
        return ticket;
    }

    private void stubPoolSufficient(int reservedCount) {
        when(ticketRepository.reserveTickets(anyLong(), anyLong(), anyInt(), any(), anyLong()))
                .thenReturn(java.util.stream.IntStream.range(0, reservedCount)
                        .mapToObj(i -> ticket(1000L + i)).toList());
    }

    @Test
    void reserveTickets_poolSufficient_noLockNoInsert() {
        when(userService.findByEmail("a@b.c")).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findById(10L)).thenReturn(Optional.of(ticketType));
        stubOrderFlow();
        stubPoolSufficient(2);

        ReserveTicketResponse response = ticketService.reserveTickets("a@b.c", request(2));

        assertEquals(2, response.getItems().get(0).getQuantity());
        assertEquals(200000L, response.getTotalAmount());
        verify(ticketTypeRepository, never()).findByIdForUpdate(anyLong());
        verify(ticketPoolJdbcDao, never()).insertAvailableBatch(anyLong(), anyLong(), anyInt());
        verify(ticketTypeRepository, never()).decrementAvailableQuantity(anyLong(), anyInt());
    }

    @Test
    void reserveTickets_poolEmpty_refillsThenTakes() {
        when(userService.findByEmail("a@b.c")).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findById(10L)).thenReturn(Optional.of(ticketType));
        stubOrderFlow();

        when(ticketRepository.reserveTickets(anyLong(), anyLong(), anyInt(), any(), anyLong()))
                .thenReturn(List.of())
                .thenReturn(List.of(ticket(1001L), ticket(1002L)));
        when(ticketRepository.countTakeable(10L, 1L)).thenReturn(0);
        when(ticketTypeRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(ticketType));
        when(ticketTypeRepository.decrementAvailableQuantity(10L, 500)).thenReturn(1);

        ReserveTicketResponse response = ticketService.reserveTickets("a@b.c", request(2));

        assertEquals(2, response.getItems().get(0).getQuantity());
        verify(ticketPoolJdbcDao).insertAvailableBatch(10L, 1L, 500);
        verify(ticketTypeRepository).decrementAvailableQuantity(10L, 500);
    }

    @Test
    void reserveTickets_afterLockTakeableEnough_skipsInsert() {
        when(userService.findByEmail("a@b.c")).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findById(10L)).thenReturn(Optional.of(ticketType));
        stubOrderFlow();

        when(ticketRepository.reserveTickets(anyLong(), anyLong(), anyInt(), any(), anyLong()))
                .thenReturn(List.of())
                .thenReturn(List.of(ticket(1003L), ticket(1004L)));
        when(ticketRepository.countTakeable(10L, 1L)).thenReturn(2);
        when(ticketTypeRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(ticketType));

        ReserveTicketResponse response = ticketService.reserveTickets("a@b.c", request(2));

        assertEquals(2, response.getItems().get(0).getQuantity());
        verify(ticketPoolJdbcDao, never()).insertAvailableBatch(anyLong(), anyLong(), anyInt());
        verify(ticketTypeRepository, never()).decrementAvailableQuantity(anyLong(), anyInt());
    }

    @Test
    void reserveTickets_ledgerZero_throwsNotEnough() {
        when(userService.findByEmail("a@b.c")).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findById(10L)).thenReturn(Optional.of(ticketType));
        stubOrderFlow();

        when(ticketRepository.reserveTickets(anyLong(), anyLong(), anyInt(), any(), anyLong()))
                .thenReturn(List.of());
        when(ticketRepository.countTakeable(10L, 1L)).thenReturn(0);
        ticketType.setAvailableQuantity(0);
        when(ticketTypeRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(ticketType));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.reserveTickets("a@b.c", request(2)));

        assertEquals("error.ticket.not-enough", ex.getMessageKey());
        verify(ticketPoolJdbcDao, never()).insertAvailableBatch(anyLong(), anyLong(), anyInt());
    }

    @Test
    void materializeWarmBatch_capsAtWarmSize() {
        TicketType big = new TicketType();
        big.setId(10L);
        big.setEventId(1L);
        big.setTotalQuantity(5000);
        big.setAvailableQuantity(5000);

        TicketType small = new TicketType();
        small.setId(11L);
        small.setEventId(1L);
        small.setTotalQuantity(30);
        small.setAvailableQuantity(30);

        when(ticketTypeRepository.findByEventId(1L)).thenReturn(List.of(big, small));

        ticketService.materializeWarmBatch(1L);

        verify(ticketPoolJdbcDao).insertAvailableBatch(10L, 1L, 100);
        verify(ticketTypeRepository).decrementAvailableQuantity(10L, 100);
        verify(ticketPoolJdbcDao).insertAvailableBatch(11L, 1L, 30);
        verify(ticketTypeRepository).decrementAvailableQuantity(11L, 30);
    }

}
