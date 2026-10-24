package com.trungpd.eventticketplatform.orders.service;

import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.orders.dto.request.CreateOrderRequest;
import com.trungpd.eventticketplatform.orders.dto.request.MockPaymentRequest;
import com.trungpd.eventticketplatform.orders.dto.response.MockPaymentResponse;
import com.trungpd.eventticketplatform.orders.dto.response.OrderResponse;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;

public interface IOrderService {

    OrderResponse createFromReservation(Long userId, CreateOrderRequest request);

    MockPaymentResponse mockPay(Long userId, Long orderId, MockPaymentRequest request);

    void cancel(Long userId, Long orderId);

    OrderResponse get(Long userId, Long orderId);

    PagedResponse<OrderResponse> myOrders(Long userId, OrderStatus status, int page, int size);

    void expirePendingOrders();
}
