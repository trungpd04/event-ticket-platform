package com.trungpd.eventticketplatform.ticketing.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.events.repository.OptionSetValueRepository;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.entity.OrderDetail;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderDetailRepository;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
import com.trungpd.eventticketplatform.ticketing.dto.request.ReservationItemRequest;
import com.trungpd.eventticketplatform.ticketing.dto.request.ReserveTicketRequest;
import com.trungpd.eventticketplatform.ticketing.dto.response.ReserveTicketResponse;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import com.trungpd.eventticketplatform.ticketing.repository.TicketPoolJdbcDao;
import com.trungpd.eventticketplatform.ticketing.repository.TicketRepository;
import com.trungpd.eventticketplatform.ticketing.repository.TicketTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test cho luồng đặt vé (reservation) của TicketService.
 *
 * - Đặt vé chỉ được khi event đang PUBLISHED và trong khung giờ mở bán.
 * - Loại vé phải thuộc event đang đặt.
 * - Số lượng phải nằm trong giới hạn min/max của loại vé.
 * - Hủy reservation sẽ trả lại vé và đóng đơn hàng.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TicketServiceReservationTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private TicketTypeRepository ticketTypeRepository;
    @Mock private TicketPoolJdbcDao ticketPoolJdbcDao;
    @Mock private EventRepository eventRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private OrderDetailRepository orderDetailRepository;
    @Mock private IUserService userService;
    @Mock private OptionSetValueRepository optionSetValueRepository;

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
        ticketType.setMinPerOrder(1);
        ticketType.setMaxPerOrder(10);
    }

    private ReserveTicketRequest request(int quantity) {
        ReservationItemRequest item = new ReservationItemRequest();
        item.setTicketTypeId(10L);
        item.setQuantity(quantity);

        ReserveTicketRequest request = new ReserveTicketRequest();
        request.setEventId(1L);
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

    private void stubHappyPath(int quantity) {
        when(userService.findById(1L)).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findById(10L)).thenReturn(Optional.of(ticketType));
        stubOrderFlow();
        when(ticketRepository.reserveTickets(anyLong(), anyLong(), anyInt(), any(), anyLong()))
                .thenReturn(java.util.stream.IntStream.range(0, quantity)
                        .mapToObj(i -> ticket(1000L + i)).toList());
    }

    @Test
    void reserveTickets_success_shouldCreatePendingOrder() {
        stubHappyPath(2);

        ReserveTicketResponse response = ticketService.reserveTickets(1L, request(2));

        assertNotNull(response);
        assertNotNull(response.getReservationId());
        assertEquals(2, response.getItems().get(0).getQuantity());
        assertEquals(200000L, response.getTotalAmount());
        assertNotNull(response.getReservedUntil());

        verify(orderRepository, times(2)).save(any(Order.class));
        verify(orderDetailRepository).saveAll(anyList());
        verify(ticketRepository).reserveTickets(10L, 1L, 2, response.getReservedUntil(), 200L);
    }

    @Test
    void reserveTickets_eventNotPublished_shouldThrow() {
        event.setStatus(EventStatus.PENDING_REVIEW);
        when(userService.findById(1L)).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.reserveTickets(1L, request(1)));

        assertEquals("error.event.not-published", ex.getMessageKey());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void reserveTickets_eventAlreadyStarted_shouldThrow() {
        event.setStatus(EventStatus.ONGOING);
        when(userService.findById(1L)).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.reserveTickets(1L, request(1)));

        assertEquals("error.event.already-started", ex.getMessageKey());
    }

    @Test
    void reserveTickets_saleNotStarted_shouldThrow() {
        event.setTicketSaleStartTime(LocalDateTime.now().plusDays(1));
        when(userService.findById(1L)).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.reserveTickets(1L, request(1)));

        assertEquals("error.event.sale-not-started", ex.getMessageKey());
    }

    @Test
    void reserveTickets_saleEnded_shouldThrow() {
        event.setTicketSaleEndTime(LocalDateTime.now().minusDays(1));
        when(userService.findById(1L)).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.reserveTickets(1L, request(1)));

        assertEquals("error.event.sale-ended", ex.getMessageKey());
    }

    @Test
    void reserveTickets_ticketTypeNotInEvent_shouldThrow() {
        ticketType.setEventId(2L);
        when(userService.findById(1L)).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findById(10L)).thenReturn(Optional.of(ticketType));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.reserveTickets(1L, request(1)));

        assertEquals("error.ticket-type.not-in-event", ex.getMessageKey());
    }

    @Test
    void reserveTickets_quantityBelowMin_shouldThrow() {
        ticketType.setMinPerOrder(2);
        when(userService.findById(1L)).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findById(10L)).thenReturn(Optional.of(ticketType));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.reserveTickets(1L, request(1)));

        assertEquals("error.ticket-type.order-limit.invalid", ex.getMessageKey());
    }

    @Test
    void reserveTickets_quantityAboveMax_shouldThrow() {
        ticketType.setMaxPerOrder(5);
        when(userService.findById(1L)).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(ticketTypeRepository.findById(10L)).thenReturn(Optional.of(ticketType));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.reserveTickets(1L, request(6)));

        assertEquals("error.ticket-type.order-limit.invalid", ex.getMessageKey());
    }

    @Test
    void releaseTickets_success_shouldCancelOrderAndReleaseTickets() {
        Order order = new Order();
        order.setId(100L);
        order.setCustomerId(1L);
        order.setStatus(OrderStatus.PENDING_PAYMENT);

        OrderDetail detail = new OrderDetail();
        detail.setId(200L);

        when(userService.findById(1L)).thenReturn(user);
        when(orderRepository.findByOrderCode("RES-123")).thenReturn(Optional.of(order));
        when(orderDetailRepository.findByOrderId(100L)).thenReturn(List.of(detail));
        when(ticketRepository.releaseTicketsByOrderDetailId(200L)).thenReturn(2);

        ticketService.releaseTickets(1L, "RES-123");

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(ticketRepository).releaseTicketsByOrderDetailId(200L);
        verify(orderRepository).save(order);
    }

    @Test
    void releaseTickets_notOwner_shouldThrow() {
        Order order = new Order();
        order.setId(100L);
        order.setCustomerId(99L);
        order.setStatus(OrderStatus.PENDING_PAYMENT);

        when(userService.findById(1L)).thenReturn(user);
        when(orderRepository.findByOrderCode("RES-123")).thenReturn(Optional.of(order));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.releaseTickets(1L, "RES-123"));

        assertEquals("error.order.not-owner", ex.getMessageKey());
        verify(ticketRepository, never()).releaseTicketsByOrderDetailId(anyLong());
    }

    @Test
    void releaseTickets_orderNotPending_shouldThrow() {
        Order order = new Order();
        order.setId(100L);
        order.setCustomerId(1L);
        order.setStatus(OrderStatus.PAID);

        when(userService.findById(1L)).thenReturn(user);
        when(orderRepository.findByOrderCode("RES-123")).thenReturn(Optional.of(order));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> ticketService.releaseTickets(1L, "RES-123"));

        assertEquals("error.order.cannot-release", ex.getMessageKey());
    }
}
