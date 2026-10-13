package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventPayoutInfoResponse {

    private String bankName;

    private String accountNumber;

    private String accountHolder;

    private String branch;

}
