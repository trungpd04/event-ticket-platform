package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FeePolicySnapshotResponse {

    private BigDecimal organizerCommissionRate;
    private BigDecimal customerFeeRate;
    private Long customerFlatFee;

}
