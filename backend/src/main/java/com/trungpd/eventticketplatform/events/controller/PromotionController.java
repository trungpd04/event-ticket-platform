package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.events.dto.request.PromotionRequest;
import com.trungpd.eventticketplatform.events.dto.request.ValidatePromotionRequest;
import com.trungpd.eventticketplatform.events.dto.response.PromotionResponse;
import com.trungpd.eventticketplatform.events.dto.response.PromotionValidationResponse;
import com.trungpd.eventticketplatform.events.service.PromotionService;
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
@RequiredArgsConstructor
@Tag(name = "Promotion", description = "API quản lý mã giảm giá")
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping("/api/v1/events/{eventId}/promotions")
    @PreAuthorize("hasRole('ORGANIZER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(
            @AuthenticationPrincipal String email,
            @PathVariable Long eventId,
            @Valid @RequestBody PromotionRequest request) {
        PromotionResponse response = promotionService.createPromotion(email, eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/events/{eventId}/promotions")
    @PreAuthorize("hasRole('ORGANIZER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getPromotionsByEvent(
            @PathVariable Long eventId) {
        List<PromotionResponse> response = promotionService.getPromotionsByEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/promotions/validate")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<PromotionValidationResponse>> validatePromotion(
            @Valid @RequestBody ValidatePromotionRequest request) {
        PromotionValidationResponse response = promotionService.validatePromotion(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
