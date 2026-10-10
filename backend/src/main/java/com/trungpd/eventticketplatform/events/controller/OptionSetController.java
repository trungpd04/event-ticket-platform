package com.trungpd.eventticketplatform.events.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetValueResponse;
import com.trungpd.eventticketplatform.events.service.OptionSetService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/option-sets")
@RequiredArgsConstructor
@Tag(name = "Option Set", description = "API lấy cấu hình động công khai")
public class OptionSetController {

    private final OptionSetService optionSetService;

    @GetMapping("/{code}/values")
    public ResponseEntity<ApiResponse<List<OptionSetValueResponse>>> getValuesByCode(@PathVariable String code) {
        List<OptionSetValueResponse> response = optionSetService.getValuesByCode(code);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
