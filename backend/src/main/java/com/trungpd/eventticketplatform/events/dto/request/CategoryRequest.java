package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "{error.validation.name-required}")
    private String name;

    private String slug;

    private String iconUrl;

    @NotNull(message = "{error.validation.is-active-required}")
    private Boolean isActive;

}
