package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PromotionValidationResponse {

    private String code;
    private BigDecimal discountPercent;
    private Long maxDiscount;
    private boolean isValid;

}
