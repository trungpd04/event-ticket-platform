package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.events.dto.request.OptionSetRequest;
import com.trungpd.eventticketplatform.events.dto.request.OptionSetValueRequest;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetDetailResponse;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetResponse;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetValueResponse;
import com.trungpd.eventticketplatform.events.service.OptionSetService;
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
@RequestMapping("/api/v1/admin/option-sets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Option Set", description = "API quản lý cấu hình động")
public class OptionSetAdminController {

    private final OptionSetService optionSetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OptionSetResponse>>> getAllOptionSets() {
        List<OptionSetResponse> response = optionSetService.getAllOptionSets();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<OptionSetDetailResponse>> getOptionSetByCode(@PathVariable String code) {
        OptionSetDetailResponse response = optionSetService.getOptionSetByCode(code);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OptionSetResponse>> createOptionSet(
            @Valid @RequestBody OptionSetRequest request) {
        OptionSetResponse response = optionSetService.createOptionSet(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{code}")
    public ResponseEntity<ApiResponse<OptionSetResponse>> updateOptionSet(
            @PathVariable String code,
            @Valid @RequestBody OptionSetRequest request) {
        OptionSetResponse response = optionSetService.updateOptionSet(code, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{code}/values")
    public ResponseEntity<ApiResponse<List<OptionSetValueResponse>>> getValuesByOptionSetCode(
            @PathVariable String code) {
        List<OptionSetValueResponse> response = optionSetService.getValuesByOptionSetCode(code);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{code}/values")
    public ResponseEntity<ApiResponse<OptionSetValueResponse>> createOptionSetValue(
            @PathVariable String code,
            @Valid @RequestBody OptionSetValueRequest request) {
        OptionSetValueResponse response = optionSetService.createOptionSetValue(code, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{code}/values/{valueCode}")
    public ResponseEntity<ApiResponse<OptionSetValueResponse>> updateOptionSetValue(
            @PathVariable String code,
            @PathVariable String valueCode,
            @Valid @RequestBody OptionSetValueRequest request) {
        OptionSetValueResponse response = optionSetService.updateOptionSetValue(code, valueCode, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
