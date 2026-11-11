package com.trungpd.eventticketplatform.operations.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.service.IEventCheckerService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/checkers")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Checker", description = "API dành cho nhân viên soát vé")
public class CheckerController {

    private final IEventCheckerService eventCheckerService;

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('CHECKER')")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyEvents(
            @AuthenticationPrincipal Long checkerUserId) {
        List<EventResponse> response = eventCheckerService.findAssignedEvents(checkerUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
