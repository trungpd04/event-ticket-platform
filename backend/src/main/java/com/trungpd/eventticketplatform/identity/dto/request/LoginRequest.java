package com.trungpd.eventticketplatform.identity.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "{error.validation.email-required}")
    @Email(message = "{error.validation.email-invalid}")
    private String email;

    @NotBlank(message = "{error.validation.password-required}")
    private String password;

}
