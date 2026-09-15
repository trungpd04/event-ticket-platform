package com.trungpd.eventticketplatform.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "{error.validation.full-name-required}")
    private String fullName;

    private String phone;

}
