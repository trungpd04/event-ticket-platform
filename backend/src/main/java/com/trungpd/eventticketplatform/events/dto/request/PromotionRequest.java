package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class PromotionRequest {

    @NotBlank(message = "{error.validation.promotion-code-required}")
    @Size(max = 50, message = "{error.validation.promotion-code-too-long}")
    private String code;

    @NotNull(message = "{error.validation.discount-percent-required}")
    @DecimalMin(value = "0.00", message = "{error.validation.discount-percent-range}")
    @DecimalMax(value = "100.00", message = "{error.validation.discount-percent-range}")
    private BigDecimal discountPercent;

    @NotNull(message = "{error.validation.max-discount-required}")
    @Min(value = 0, message = "{error.validation.max-discount-positive}")
    private Long maxDiscount;

    @NotNull(message = "{error.validation.usage-limit-required}")
    @Min(value = 1, message = "{error.validation.usage-limit-positive}")
    private Integer usageLimit;

    @NotNull(message = "{error.validation.valid-from-required}")
    private Instant validFrom;

    @NotNull(message = "{error.validation.valid-until-required}")
    private Instant validUntil;

}
