package com.trungpd.eventticketplatform.operations.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.operations.dto.request.CheckInRequest;
import com.trungpd.eventticketplatform.operations.dto.response.CheckInResponse;
import com.trungpd.eventticketplatform.operations.service.ICheckInService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/check-in")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Check-in", description = "API check-in vé bằng mã QR")
public class CheckInController {

    private final ICheckInService checkInService;

    @PostMapping
    @PreAuthorize("hasRole('CHECKER')")
    public ResponseEntity<ApiResponse<CheckInResponse>> checkIn(
            @AuthenticationPrincipal Long checkerUserId,
            @Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(checkInService.checkIn(checkerUserId, request)));
    }
}
