package com.trungpd.eventticketplatform.operations.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckInRequest {

    @NotBlank
    private String qrCode;
}
