package com.trungpd.eventticketplatform.orders.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.common.mapper.PaginationMapper;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.entity.Promotion;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.events.repository.PromotionRepository;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.IEmailService;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import com.trungpd.eventticketplatform.orders.dto.request.CreateOrderRequest;
import com.trungpd.eventticketplatform.orders.dto.request.MockPaymentRequest;
import com.trungpd.eventticketplatform.orders.dto.response.MockPaymentResponse;
import com.trungpd.eventticketplatform.orders.dto.response.OrderResponse;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.orders.entity.OrderDetail;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.repository.OrderDetailRepository;
import com.trungpd.eventticketplatform.orders.repository.OrderRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test cho luồng thanh toán và quản lý đơn hàng của OrderService.
 *
 * - Tạo đơn từ reservation: tính phí nền tảng, áp dụng khuyến mãi.
 * - Mock thanh toán: xác nhận vé RESERVED -> PAID, sinh QR, gửi email.
 * - Hủy đơn: trả vé, giảm usedCount khuyến mãi.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OrderServicePaymentTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderDetailRepository orderDetailRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private TicketTypeRepository ticketTypeRepository;
    @Mock private IUserService userService;
    @Mock private EventRepository eventRepository;
    @Mock private PromotionRepository promotionRepository;
    @Mock private IEmailService emailService;
    @Mock private PaginationMapper paginationMapper;
    @Mock private TicketQrService ticketQrService;

    @InjectMocks
    private OrderService orderService;

    private static final Long USER_ID = 1L;
    private static final Long ORDER_ID = 100L;
    private static final Long EVENT_ID = 1L;

    private User user;
    private Order pendingOrder;
    private Event event;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);
        user.setEmail("customer@example.com");

        pendingOrder = new Order();
        pendingOrder.setId(ORDER_ID);
        pendingOrder.setCustomerId(USER_ID);
        pendingOrder.setEventId(EVENT_ID);
        pendingOrder.setOrderCode("RES-123456");
        pendingOrder.setStatus(OrderStatus.PENDING_PAYMENT);
        pendingOrder.setTotalTicketAmount(200000L);
        pendingOrder.setFinalAmount(200000L);
        pendingOrder.setExpiredAt(LocalDateTime.now().plusMinutes(10));

        event = new Event();
        event.setId(EVENT_ID);
        event.setStatus(EventStatus.PUBLISHED);
        event.setSecretKey("event-secret-key");
        event.setEndTime(LocalDateTime.now().plusDays(1));
    }

    private OrderDetail detail(int quantity) {
        OrderDetail detail = new OrderDetail();
        detail.setId(200L);
        detail.setOrderId(ORDER_ID);
        detail.setTicketTypeId(10L);
        detail.setQuantity(quantity);
        detail.setUnitPrice(100000L);
        detail.setSubtotal(100000L * quantity);
        return detail;
    }

    private Ticket ticket(Long id, TicketStatus status) {
        Ticket ticket = new Ticket();
        ticket.setId(id);
        ticket.setEventId(EVENT_ID);
        ticket.setTicketTypeId(10L);
        ticket.setOrderDetailId(200L);
        ticket.setStatus(status);
        return ticket;
    }

    private MockPaymentRequest mockPaymentRequest() {
        MockPaymentRequest request = new MockPaymentRequest();
        request.setPaymentMethod("MOCK_VNPAY");
        request.setReturnMessage("Thanh toán thành công");
        return request;
    }

    private void stubPaymentDependencies(int quantity) {
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));
        when(orderDetailRepository.findByOrderId(ORDER_ID)).thenReturn(List.of(detail(quantity)));
        when(ticketRepository.findByOrderDetailIdIn(List.of(200L)))
                .thenReturn(java.util.stream.IntStream.range(0, quantity)
                        .mapToObj(i -> ticket(1000L + i, TicketStatus.RESERVED))
                        .toList());
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(ticketQrService.generate(any(Ticket.class), any(Order.class), any(Event.class)))
                .thenReturn("signed-qr-jwt");
        when(ticketRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void mockPay_success_shouldMarkTicketsPaidAndGenerateQr() {
        stubPaymentDependencies(2);

        MockPaymentResponse response = orderService.mockPay(USER_ID, ORDER_ID, mockPaymentRequest());

        assertNotNull(response);
        assertEquals(ORDER_ID, response.getOrderId());
        assertEquals(OrderStatus.PAID, pendingOrder.getStatus());
        assertEquals("Thanh toán thành công", response.getMessage());
        assertNotNull(pendingOrder.getPaidAt());

        verify(ticketRepository).saveAll(anyList());
        verify(emailService).sendTicketEmail(anyString(), anyString(), anyString());
    }

    @Test
    void mockPay_success_withPromotion_shouldIncrementUsedCount() {
        pendingOrder.setPromotionId(5L);
        stubPaymentDependencies(2);
        when(promotionRepository.incrementUsedCount(5L)).thenReturn(1);

        orderService.mockPay(USER_ID, ORDER_ID, mockPaymentRequest());

        verify(promotionRepository).incrementUsedCount(5L);
    }

    @Test
    void mockPay_invalidPaymentMethod_shouldThrow() {
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));

        MockPaymentRequest request = new MockPaymentRequest();
        request.setPaymentMethod("CASH");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.mockPay(USER_ID, ORDER_ID, request));

        assertEquals("error.order.invalid-payment-method", ex.getMessageKey());
    }

    @Test
    void mockPay_notOwner_shouldThrow() {
        pendingOrder.setCustomerId(99L);
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.mockPay(USER_ID, ORDER_ID, mockPaymentRequest()));

        assertEquals("error.order.not-owner", ex.getMessageKey());
    }

    @Test
    void mockPay_orderAlreadyPaid_shouldThrow() {
        pendingOrder.setStatus(OrderStatus.PAID);
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.mockPay(USER_ID, ORDER_ID, mockPaymentRequest()));

        assertEquals("error.order.cannot-pay", ex.getMessageKey());
    }

    @Test
    void mockPay_orderExpired_shouldThrow() {
        pendingOrder.setExpiredAt(LocalDateTime.now().minusMinutes(1));
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.mockPay(USER_ID, ORDER_ID, mockPaymentRequest()));

        assertEquals("error.order.expired", ex.getMessageKey());
    }

    @Test
    void mockPay_notEnoughReservedTickets_shouldThrow() {
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));
        when(orderDetailRepository.findByOrderId(ORDER_ID)).thenReturn(List.of(detail(2)));
        when(ticketRepository.findByOrderDetailIdIn(List.of(200L)))
                .thenReturn(List.of(ticket(1000L, TicketStatus.RESERVED)));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.mockPay(USER_ID, ORDER_ID, mockPaymentRequest()));

        assertEquals("error.ticket.not-enough-reserved", ex.getMessageKey());
    }

    @Test
    void mockPay_ticketNotReserved_shouldThrow() {
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));
        when(orderDetailRepository.findByOrderId(ORDER_ID)).thenReturn(List.of(detail(1)));
        when(ticketRepository.findByOrderDetailIdIn(List.of(200L)))
                .thenReturn(List.of(ticket(1000L, TicketStatus.AVAILABLE)));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.mockPay(USER_ID, ORDER_ID, mockPaymentRequest()));

        assertEquals("error.ticket.invalid-status", ex.getMessageKey());
    }

    @Test
    void createFromReservation_success_shouldApplyFeesSnapshot() {
        pendingOrder.setPlatformFee(0L);
        pendingOrder.setCommissionFee(0L);
        pendingOrder.setFinalAmount(0L);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setReservationId("RES-123456");

        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findByOrderCode("RES-123456")).thenReturn(Optional.of(pendingOrder));
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderDetailRepository.findByOrderId(ORDER_ID)).thenReturn(List.of(detail(2)));
        when(ticketTypeRepository.findAllById(anyList())).thenReturn(List.of());

        event.setCustomerFlatFeeSnapshot(5000L);
        event.setCustomerFeeRateSnapshot(BigDecimal.valueOf(0.05));
        event.setOrganizerCommissionRateSnapshot(BigDecimal.valueOf(0.1));

        OrderResponse response = orderService.createFromReservation(USER_ID, request);

        assertEquals(15000L, pendingOrder.getPlatformFee());   // 5000 + 200000*0.05
        assertEquals(20000L, pendingOrder.getCommissionFee()); // 200000*0.1
        assertEquals(215000L, response.getFinalAmount());      // 200000 + 15000
    }

    @Test
    void createFromReservation_withValidPromotion_shouldApplyDiscount() {
        pendingOrder.setPlatformFee(0L);
        pendingOrder.setDiscountAmount(0L);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setReservationId("RES-123456");
        request.setPromotionCode("SUMMER10");

        Promotion promotion = new Promotion();
        promotion.setId(5L);
        promotion.setEventId(EVENT_ID);
        promotion.setCode("SUMMER10");
        promotion.setDiscountPercent(BigDecimal.valueOf(10));
        promotion.setMaxDiscount(50000L);
        promotion.setUsageLimit(100);
        promotion.setUsedCount(0);
        promotion.setValidFrom(LocalDateTime.now().minusDays(1));
        promotion.setValidUntil(LocalDateTime.now().plusDays(1));

        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findByOrderCode("RES-123456")).thenReturn(Optional.of(pendingOrder));
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(promotionRepository.findByEventIdAndCodeIgnoreCase(EVENT_ID, "SUMMER10"))
                .thenReturn(Optional.of(promotion));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderDetailRepository.findByOrderId(ORDER_ID)).thenReturn(List.of(detail(2)));
        when(ticketTypeRepository.findAllById(anyList())).thenReturn(List.of());

        OrderResponse response = orderService.createFromReservation(USER_ID, request);

        assertEquals(5L, pendingOrder.getPromotionId());
        assertEquals(20000L, pendingOrder.getDiscountAmount()); // 10% của 200000
        assertEquals(180000L, response.getFinalAmount());
    }

    @Test
    void createFromReservation_promotionAlreadyApplied_shouldThrow() {
        // Đặt phí đã được tính để ensureFeesSnapshot không load event
        pendingOrder.setPromotionId(5L);
        pendingOrder.setPlatformFee(1000L);
        pendingOrder.setCommissionFee(1000L);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setReservationId("RES-123456");
        request.setPromotionCode("SUMMER10");

        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findByOrderCode("RES-123456")).thenReturn(Optional.of(pendingOrder));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.createFromReservation(USER_ID, request));

        assertEquals("error.order.promotion-already-applied", ex.getMessageKey());
    }

    @Test
    void cancel_success_shouldReleaseTicketsAndCancelOrder() {
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));
        when(orderDetailRepository.findByOrderId(ORDER_ID)).thenReturn(List.of(detail(2)));
        when(ticketRepository.releaseTicketsByOrderDetailIds(List.of(200L))).thenReturn(2);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        orderService.cancel(USER_ID, ORDER_ID);

        assertEquals(OrderStatus.CANCELLED, pendingOrder.getStatus());
        verify(ticketRepository).releaseTicketsByOrderDetailIds(List.of(200L));
    }

    @Test
    void cancel_withPromotion_shouldDecrementUsedCount() {
        pendingOrder.setPromotionId(5L);
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));
        when(orderDetailRepository.findByOrderId(ORDER_ID)).thenReturn(List.of(detail(2)));
        when(ticketRepository.releaseTicketsByOrderDetailIds(List.of(200L))).thenReturn(2);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        orderService.cancel(USER_ID, ORDER_ID);

        verify(promotionRepository).decrementUsedCount(5L);
    }

    @Test
    void cancel_expiredOrder_shouldThrow() {
        pendingOrder.setExpiredAt(LocalDateTime.now().minusMinutes(1));
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(pendingOrder));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.cancel(USER_ID, ORDER_ID));

        assertEquals("error.order.expired", ex.getMessageKey());
        verify(ticketRepository, never()).releaseTicketsByOrderDetailIds(anyList());
    }

    @Test
    void get_orderNotFound_shouldThrow() {
        when(userService.findById(USER_ID)).thenReturn(user);
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> orderService.get(USER_ID, ORDER_ID));
    }
}
