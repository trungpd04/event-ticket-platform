package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FeePolicyRequest {

    @NotBlank(message = "{error.validation.name-required}")
    private String name;

    @NotNull(message = "{error.validation.commission-rate-required}")
    @DecimalMin(value = "0.0", inclusive = true, message = "{error.validation.commission-rate-range}")
    @DecimalMax(value = "1.0", inclusive = true, message = "{error.validation.commission-rate-range}")
    private BigDecimal organizerCommissionRate;

    @NotNull(message = "{error.validation.customer-fee-rate-required}")
    @DecimalMin(value = "0.0", inclusive = true, message = "{error.validation.customer-fee-rate-range}")
    @DecimalMax(value = "1.0", inclusive = true, message = "{error.validation.customer-fee-rate-range}")
    private BigDecimal customerFeeRate;

    @NotNull(message = "{error.validation.customer-flat-fee-required}")
    @PositiveOrZero(message = "{error.validation.customer-flat-fee-positive}")
    private Long customerFlatFee;

    @NotNull(message = "{error.validation.is-active-required}")
    private Boolean isActive;

    @NotNull(message = "{error.validation.is-default-required}")
    private Boolean isDefault;

}
