package com.trungpd.eventticketplatform.finance.payout.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.finance.payout.PayoutStatus;
import com.trungpd.eventticketplatform.finance.payout.dto.request.CreatePayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.response.PayoutResponse;
import com.trungpd.eventticketplatform.finance.payout.dto.response.PayoutSummaryResponse;
import com.trungpd.eventticketplatform.finance.payout.service.IPayoutService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organizer/payout-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ORGANIZER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Organizer Payout", description = "API chi trả doanh thu cho Organizer")
public class OrganizerPayoutController {

    private final IPayoutService payoutService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PayoutSummaryResponse>> getSummary(
            @AuthenticationPrincipal Long userId,
            @RequestParam Long eventId) {
        PayoutSummaryResponse response = payoutService.getSummary(userId, eventId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PayoutResponse>> create(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreatePayoutRequest request) {
        PayoutResponse response = payoutService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PayoutResponse>>> list(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) PayoutStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<PayoutResponse> response = payoutService.listByOrganizer(userId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PayoutResponse>> get(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        PayoutResponse response = payoutService.getByOrganizer(userId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<PayoutResponse>> cancel(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        PayoutResponse response = payoutService.cancelByOrganizer(userId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
