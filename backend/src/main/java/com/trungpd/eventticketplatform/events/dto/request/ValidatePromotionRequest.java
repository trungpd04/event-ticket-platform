package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ValidatePromotionRequest {

    @NotNull(message = "{error.validation.event-id-required}")
    private Long eventId;

    @NotBlank(message = "{error.validation.promotion-code-required}")
    private String code;

}
