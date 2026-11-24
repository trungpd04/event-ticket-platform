package com.trungpd.eventticketplatform.finance.payout.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApprovePayoutRequest {

    @PositiveOrZero(message = "{error.validation.amount-positive}")
    private Long approvedNetAmount;

    @Size(max = 500, message = "{error.validation.note-too-long}")
    private String note;

}
