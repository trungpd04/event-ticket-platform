package com.trungpd.eventticketplatform.identity.dto.request;

import com.trungpd.eventticketplatform.identity.entity.OtpType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank(message = "{error.validation.email-required}")
    @Email(message = "{error.validation.email-invalid}")
    private String email;

    @NotBlank(message = "{error.validation.otp-required}")
    private String code;

    @NotNull(message = "{error.validation.otp-type-required}")
    private OtpType type;

}
