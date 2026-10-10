package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.dto.request.UpdateEventFeePolicyRequest;
import com.trungpd.eventticketplatform.events.dto.request.UpdateEventStatusRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.enums.TimeFilter;
import com.trungpd.eventticketplatform.events.service.EventService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Event", description = "API quản trị sự kiện")
public class AdminEventController {

    private final EventService eventService;

    @PutMapping("/{id}/fee-policy")
    public ResponseEntity<ApiResponse<EventResponse>> updateEventFeePolicy(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventFeePolicyRequest request) {
        EventResponse response = eventService.updateEventFeePolicy(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<EventResponse>> publishEvent(@PathVariable Long id) {
        EventResponse response = eventService.publishEvent(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ApiResponse<EventResponse>> closeEvent(@PathVariable Long id) {
        EventResponse response = eventService.closeEvent(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<EventResponse>>> searchAdminEvents(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long provinceId,
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) TimeFilter timeFilter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<EventResponse> response = eventService.searchAdminEvents(
                title, categoryId, provinceId, status, timeFilter, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EventResponse>> updateEventStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventStatusRequest request) {
        EventResponse response = eventService.updateEventStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
