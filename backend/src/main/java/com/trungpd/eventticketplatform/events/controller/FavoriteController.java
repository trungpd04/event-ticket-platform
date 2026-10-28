package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.common.response.ResponseViews;
import com.fasterxml.jackson.annotation.JsonView;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.service.IFavoriteService;
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

    private final IFavoriteService favoriteService;

    @PostMapping("/api/v1/events/{id}/favorites")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        favoriteService.addFavorite(userId, id);
        return ResponseEntity.ok(ApiResponse.success("success.operation.completed", null));
    }

    @DeleteMapping("/api/v1/events/{id}/favorites")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        favoriteService.removeFavorite(userId, id);
        return ResponseEntity.ok(ApiResponse.success("success.operation.completed", null));
    }

    @GetMapping("/api/v1/users/me/favorites")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    @JsonView(ResponseViews.Public.class)
    public ResponseEntity<ApiResponse<PagedResponse<EventResponse>>> getFavorites(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<EventResponse> response = favoriteService.getFavorites(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
