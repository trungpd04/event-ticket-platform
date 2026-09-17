package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.service.FavoriteService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Favorite", description = "API quản lý sự kiện yêu thích")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/api/v1/events/{id}/favorites")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        favoriteService.addFavorite(email, id);
        return ResponseEntity.ok(ApiResponse.success("success.operation.completed", null));
    }

    @DeleteMapping("/api/v1/events/{id}/favorites")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        favoriteService.removeFavorite(email, id);
        return ResponseEntity.ok(ApiResponse.success("success.operation.completed", null));
    }

    @GetMapping("/api/v1/users/me/favorites")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<PagedResponse<EventResponse>>> getFavorites(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<EventResponse> response = favoriteService.getFavorites(email, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
