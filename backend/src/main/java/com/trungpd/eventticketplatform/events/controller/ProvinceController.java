package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.events.dto.response.ProvinceResponse;
import com.trungpd.eventticketplatform.events.dto.response.WardResponse;
import com.trungpd.eventticketplatform.events.service.ProvinceService;
import com.trungpd.eventticketplatform.events.service.WardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/provinces")
@RequiredArgsConstructor
@Tag(name = "Location", description = "API địa điểm tỉnh/thành và quận/huyện")
public class ProvinceController {

    private final ProvinceService provinceService;
    private final WardService wardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProvinceResponse>>> getAllProvinces() {
        List<ProvinceResponse> response = provinceService.getAllProvinces();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{provinceId}/wards")
    public ResponseEntity<ApiResponse<List<WardResponse>>> getWardsByProvince(
            @PathVariable Long provinceId) {
        List<WardResponse> response = wardService.getWardsByProvince(provinceId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
