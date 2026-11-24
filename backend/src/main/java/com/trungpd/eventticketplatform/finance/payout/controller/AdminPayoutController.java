package com.trungpd.eventticketplatform.finance.payout.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.finance.payout.PayoutStatus;
import com.trungpd.eventticketplatform.finance.payout.dto.request.ApprovePayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.request.MarkPaidRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.request.RejectPayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.response.PayoutResponse;
import com.trungpd.eventticketplatform.finance.payout.service.IPayoutService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/payout-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Payout", description = "API duyệt chi trả cho Admin")
public class AdminPayoutController {

    private final IPayoutService payoutService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PayoutResponse>>> list(
            @RequestParam(required = false) PayoutStatus status,
            @RequestParam(required = false) Long organizerId,
            @RequestParam(required = false) Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<PayoutResponse> response = payoutService.listAll(status, organizerId, eventId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PayoutResponse>> get(@PathVariable Long id) {
        PayoutResponse response = payoutService.get(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PayoutResponse>> approve(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody ApprovePayoutRequest request) {
        PayoutResponse response = payoutService.approve(adminId, id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PayoutResponse>> reject(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody RejectPayoutRequest request) {
        PayoutResponse response = payoutService.reject(adminId, id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<ApiResponse<PayoutResponse>> markPaid(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody MarkPaidRequest request) {
        PayoutResponse response = payoutService.markPaid(adminId, id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<Long>> countPending() {
        return ResponseEntity.ok(ApiResponse.success(payoutService.countPending()));
    }
}
