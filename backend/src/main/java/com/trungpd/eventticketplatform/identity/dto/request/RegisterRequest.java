package com.trungpd.eventticketplatform.identity.dto.request;

import com.trungpd.eventticketplatform.identity.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "{error.validation.email-required}")
    @Email(message = "{error.validation.email-invalid}")
    private String email;

    @NotBlank(message = "{error.validation.password-required}")
    @Size(min = 8, message = "{error.validation.password-too-short}")
    private String password;

    @NotBlank(message = "{error.validation.full-name-required}")
    private String fullName;

    private String phone;

    @NotNull(message = "{error.validation.role-required}")
    private Role role;

}
