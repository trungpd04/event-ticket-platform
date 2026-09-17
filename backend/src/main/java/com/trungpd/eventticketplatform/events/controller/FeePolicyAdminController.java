package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.events.dto.request.FeePolicyRequest;
import com.trungpd.eventticketplatform.events.dto.response.FeePolicyResponse;
import com.trungpd.eventticketplatform.events.service.FeePolicyService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/fee-policies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Fee Policy", description = "API quản lý gói cước")
public class FeePolicyAdminController {

    private final FeePolicyService feePolicyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeePolicyResponse>>> getAllFeePolicies() {
        List<FeePolicyResponse> response = feePolicyService.getAllFeePolicies();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeePolicyResponse>> createFeePolicy(
            @Valid @RequestBody FeePolicyRequest request) {
        FeePolicyResponse response = feePolicyService.createFeePolicy(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FeePolicyResponse>> updateFeePolicy(
            @PathVariable Long id,
            @Valid @RequestBody FeePolicyRequest request) {
        FeePolicyResponse response = feePolicyService.updateFeePolicy(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
