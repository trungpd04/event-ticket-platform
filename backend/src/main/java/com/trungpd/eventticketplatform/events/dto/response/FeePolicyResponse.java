package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FeePolicyResponse {

    private Long id;
    private String name;
    private BigDecimal organizerCommissionRate;
    private BigDecimal customerFeeRate;
    private Long customerFlatFee;
    private Boolean isActive;

}
