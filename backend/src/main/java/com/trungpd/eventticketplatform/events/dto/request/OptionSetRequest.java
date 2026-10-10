package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OptionSetRequest {

    @NotBlank(message = "{error.validation.option-set-code-required}")
    private String code;

    @NotBlank(message = "{error.validation.name-required}")
    private String name;

    private String description;

    @NotBlank(message = "{error.validation.status-required}")
    private String status;

}
