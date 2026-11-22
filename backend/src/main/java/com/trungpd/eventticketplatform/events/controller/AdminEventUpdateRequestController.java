package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.dto.request.RejectEventUpdateRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventUpdateRequestResponse;
import com.trungpd.eventticketplatform.events.entity.EventUpdateRequestStatus;
import com.trungpd.eventticketplatform.events.service.IEventUpdateRequestService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/event-update-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Event Update Request", description = "API quản lý yêu cầu cập nhật sự kiện")
public class AdminEventUpdateRequestController {

    private final IEventUpdateRequestService eventUpdateRequestService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<EventUpdateRequestResponse>>> getEventUpdateRequests(
            @RequestParam(required = false) EventUpdateRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<EventUpdateRequestResponse> response = eventUpdateRequestService.getEventUpdateRequests(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventUpdateRequestResponse>> getEventUpdateRequestDetail(@PathVariable Long id) {
        EventUpdateRequestResponse response = eventUpdateRequestService.getEventUpdateRequestDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<EventUpdateRequestResponse>> approveEventUpdateRequest(
            @AuthenticationPrincipal Long adminUserId,
            @PathVariable Long id) {
        EventUpdateRequestResponse response = eventUpdateRequestService.approveEventUpdateRequest(adminUserId, id);
        return ResponseEntity.ok(ApiResponse.success("success.event-update-request.approved", response));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<EventUpdateRequestResponse>> rejectEventUpdateRequest(
            @AuthenticationPrincipal Long adminUserId,
            @PathVariable Long id,
            @Valid @RequestBody RejectEventUpdateRequest request) {
        EventUpdateRequestResponse response = eventUpdateRequestService.rejectEventUpdateRequest(adminUserId, id, request);
        return ResponseEntity.ok(ApiResponse.success("success.event-update-request.rejected", response));
    }

}
