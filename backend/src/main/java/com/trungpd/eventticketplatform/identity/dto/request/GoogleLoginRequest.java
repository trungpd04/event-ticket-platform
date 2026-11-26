package com.trungpd.eventticketplatform.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "{error.validation.google-token-required}")
    private String idToken;
}
