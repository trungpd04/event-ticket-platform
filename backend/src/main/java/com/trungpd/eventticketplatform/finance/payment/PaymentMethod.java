package com.trungpd.eventticketplatform.finance.payment;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PaymentMethod {

    private String code;
    private String name;
    private String description;
    private String logoUrl;
    private boolean active;
}
