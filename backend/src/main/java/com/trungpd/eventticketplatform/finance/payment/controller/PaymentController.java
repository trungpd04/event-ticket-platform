package com.trungpd.eventticketplatform.finance.payment.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.finance.payment.PaymentMethod;
import com.trungpd.eventticketplatform.finance.payment.IPaymentMethodService;
import com.trungpd.eventticketplatform.finance.payment.PaymentProviderType;
import com.trungpd.eventticketplatform.finance.payment.IPaymentService;
import com.trungpd.eventticketplatform.finance.payment.PaymentStatusResponse;
import com.trungpd.eventticketplatform.finance.payment.response.PaymentResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Payment")
public class PaymentController {

    private final IPaymentService paymentService;
    private final IPaymentMethodService paymentMethodService;

    @PostMapping("/api/v1/orders/{id}/pay")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPaymentInstruction(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestParam(required = false) PaymentProviderType provider) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.createPaymentInstruction(userId, id, provider)));
    }

    @GetMapping("/api/v1/orders/{id}/payment-status")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getPaymentStatus(
            @AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentStatus(userId, id)));
    }

    @GetMapping("/api/v1/payment-methods")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<PaymentMethod>>> getPaymentMethods() {
        return ResponseEntity.ok(ApiResponse.success(paymentMethodService.getActivePaymentMethods()));
    }
}
