package com.trungpd.eventticketplatform.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {

    @NotBlank(message = "{error.validation.refresh-token-required}")
    private String refreshToken;

}
