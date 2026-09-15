package com.trungpd.eventticketplatform.identity.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "{error.validation.email-required}")
    @Email(message = "{error.validation.email-invalid}")
    private String email;

}
