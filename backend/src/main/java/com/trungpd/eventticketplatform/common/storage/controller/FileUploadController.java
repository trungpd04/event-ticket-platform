package com.trungpd.eventticketplatform.common.storage.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.common.storage.dto.response.FileUploadResponse;
import com.trungpd.eventticketplatform.common.storage.service.FileUploadService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "API upload file lên cloud storage")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ORGANIZER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<FileUploadResponse>> upload(
            @AuthenticationPrincipal String email,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") Integer type) {
        FileUploadResponse response = fileUploadService.upload(file, type, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
}
