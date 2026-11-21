package com.trungpd.eventticketplatform.finance.payout.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MarkPaidRequest {

    @NotBlank(message = "{error.validation.transaction-ref-required}")
    @Size(max = 255, message = "{error.validation.transaction-ref-too-long}")
    private String transactionRef;

    @NotNull(message = "{error.validation.paid-at-required}")
    private LocalDateTime paidAt;

    private Long proofFileId;

}
