package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateEventFeePolicyRequest {

    @NotNull(message = "{error.validation.fee-policy-required}")
    private Long feePolicyId;

}
