package com.trungpd.eventticketplatform.finance.payout.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePayoutRequest {

    @NotNull(message = "{error.validation.event-id-required}")
    private Long eventId;

    @Size(max = 500, message = "{error.validation.note-too-long}")
    private String note;

    @Size(max = 100, message = "{error.validation.idempotency-key-too-long}")
    private String idempotencyKey;

}
