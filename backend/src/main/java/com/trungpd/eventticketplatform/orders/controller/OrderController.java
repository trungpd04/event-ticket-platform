package com.trungpd.eventticketplatform.orders.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.orders.dto.request.CreateOrderRequest;
import com.trungpd.eventticketplatform.orders.dto.request.MockPaymentRequest;
import com.trungpd.eventticketplatform.orders.dto.response.MockPaymentResponse;
import com.trungpd.eventticketplatform.orders.dto.response.OrderResponse;
import com.trungpd.eventticketplatform.orders.enums.OrderStatus;
import com.trungpd.eventticketplatform.orders.service.OrderService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Order")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponse>> create(
            @AuthenticationPrincipal String email, @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(orderService.createFromReservation(email, request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> get(
            @AuthenticationPrincipal String email, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.get(email, id)));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> mine(
            @AuthenticationPrincipal String email,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.myOrders(email, status, page, size)));
    }

    @PostMapping("/{id}/mock-pay")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<MockPaymentResponse>> pay(
            @AuthenticationPrincipal String email, @PathVariable Long id,
            @RequestBody(required = false) MockPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(orderService.mockPay(email, id,
                request == null ? new MockPaymentRequest() : request)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @AuthenticationPrincipal String email, @PathVariable Long id) {
        orderService.cancel(email, id);
        return ResponseEntity.ok(ApiResponse.success("success.operation.completed", null));
    }
}
