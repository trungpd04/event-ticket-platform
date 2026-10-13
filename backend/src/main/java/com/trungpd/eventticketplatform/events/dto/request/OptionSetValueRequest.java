package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OptionSetValueRequest {

    @NotBlank(message = "{error.validation.option-set-value-code-required}")
    private String code;

    @NotBlank(message = "{error.validation.name-required}")
    private String name;

    private String value;

    private String color;

    @NotNull(message = "{error.validation.sort-order-required}")
    private Integer sortOrder;

    @NotBlank(message = "{error.validation.status-required}")
    private String status;

}
