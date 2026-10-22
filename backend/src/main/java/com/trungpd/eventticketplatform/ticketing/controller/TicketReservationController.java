package com.trungpd.eventticketplatform.ticketing.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.ticketing.dto.request.ReleaseTicketRequest;
import com.trungpd.eventticketplatform.ticketing.dto.request.ReserveTicketRequest;
import com.trungpd.eventticketplatform.ticketing.dto.response.ReserveTicketResponse;
import com.trungpd.eventticketplatform.ticketing.dto.response.TicketStatusResponse;
import com.trungpd.eventticketplatform.ticketing.service.TicketService;
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
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
@Tag(name = "Ticket Reservation", description = "API giữ chỗ và hủy giữ vé")
public class TicketReservationController {

    private final TicketService ticketService;

    @PostMapping("/reserve")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ReserveTicketResponse>> reserveTickets(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ReserveTicketRequest request) {
        ReserveTicketResponse response = ticketService.reserveTickets(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PostMapping("/release")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> releaseTickets(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ReleaseTicketRequest request) {
        ticketService.releaseTickets(userId, request.getReservationId());
        return ResponseEntity.ok(ApiResponse.success("success.operation.completed", null));
    }

    @GetMapping("/{id}/status")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<TicketStatusResponse>> getTicketStatus(
            @PathVariable Long id) {
        TicketStatusResponse response = ticketService.getTicketStatus(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
