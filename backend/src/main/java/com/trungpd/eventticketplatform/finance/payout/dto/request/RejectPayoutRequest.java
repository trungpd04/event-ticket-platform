package com.trungpd.eventticketplatform.finance.payout.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RejectPayoutRequest {

    @NotBlank(message = "{error.validation.rejection-reason-required}")
    @Size(max = 500, message = "{error.validation.rejection-reason-too-long}")
    private String reason;

}
