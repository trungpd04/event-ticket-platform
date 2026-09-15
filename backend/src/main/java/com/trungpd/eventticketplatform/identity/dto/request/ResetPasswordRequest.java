package com.trungpd.eventticketplatform.identity.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "{error.validation.email-required}")
    @Email(message = "{error.validation.email-invalid}")
    private String email;

    @NotBlank(message = "{error.validation.otp-required}")
    private String code;

    @NotBlank(message = "{error.validation.password-required}")
    @Size(min = 8, message = "{error.validation.password-too-short}")
    private String newPassword;

}
