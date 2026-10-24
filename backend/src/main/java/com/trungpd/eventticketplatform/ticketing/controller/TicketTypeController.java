package com.trungpd.eventticketplatform.ticketing.controller;

import com.fasterxml.jackson.annotation.JsonView;
import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.response.ResponseViews;
import com.trungpd.eventticketplatform.ticketing.dto.request.CreateTicketTypeRequest;
import com.trungpd.eventticketplatform.ticketing.dto.response.TicketTypeResponse;
import com.trungpd.eventticketplatform.ticketing.service.ITicketTypeService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events/{eventId}/ticket-types")
@RequiredArgsConstructor
@Tag(name = "Ticket Type", description = "API quản lý hạng vé")
public class TicketTypeController {

    private final ITicketTypeService ticketTypeService;

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<TicketTypeResponse>> createTicketType(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long eventId,
            @Valid @RequestBody CreateTicketTypeRequest request) {
        TicketTypeResponse response = ticketTypeService.createTicketType(userId, eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    @JsonView(ResponseViews.Public.class)
    public ResponseEntity<ApiResponse<List<TicketTypeResponse>>> getTicketTypes(
            @PathVariable Long eventId) {
        List<TicketTypeResponse> response = ticketTypeService.findPublicByEventId(eventId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/organizer")
    @PreAuthorize("hasRole('ORGANIZER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<TicketTypeResponse>>> getOrganizerTicketTypes(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long eventId) {
        List<TicketTypeResponse> response = ticketTypeService.findOrganizerTicketTypes(userId, eventId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
