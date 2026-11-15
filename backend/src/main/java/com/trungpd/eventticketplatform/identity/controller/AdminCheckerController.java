package com.trungpd.eventticketplatform.identity.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.identity.dto.request.CreateCheckerRequest;
import com.trungpd.eventticketplatform.identity.dto.request.UpdateCheckerStatusRequest;
import com.trungpd.eventticketplatform.identity.dto.response.UserResponse;
import com.trungpd.eventticketplatform.identity.service.ICheckerManagementService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/checkers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Checker", description = "API quản lý nhân viên soát vé")
public class AdminCheckerController {

    private final ICheckerManagementService checkerManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getCheckers() {
        return ResponseEntity.ok(ApiResponse.success(checkerManagementService.findAllCheckers()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createChecker(
            @Valid @RequestBody CreateCheckerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(checkerManagementService.createChecker(request)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateCheckerStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCheckerStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(checkerManagementService.updateStatus(id, request)));
    }
}
