package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EventPayoutInfoRequest {

    @NotBlank(message = "{error.event.payout.bank-name-required}")
    private String bankName;

    @NotBlank(message = "{error.event.payout.account-number-required}")
    private String accountNumber;

    @NotBlank(message = "{error.event.payout.account-holder-required}")
    private String accountHolder;

    private String branch;

}
