package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class PromotionResponse {

    private Long id;
    private Long eventId;
    private String code;
    private BigDecimal discountPercent;
    private Long maxDiscount;
    private Integer usageLimit;
    private Integer usedCount;
    private Instant validFrom;
    private Instant validUntil;

}
