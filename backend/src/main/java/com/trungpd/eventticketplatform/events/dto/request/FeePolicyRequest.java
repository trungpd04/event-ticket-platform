package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FeePolicyRequest {

    @NotBlank(message = "{error.validation.name-required}")
    private String name;

    @NotNull(message = "{error.validation.commission-rate-required}")
    private BigDecimal organizerCommissionRate;

    @NotNull(message = "{error.validation.customer-fee-rate-required}")
    private BigDecimal customerFeeRate;

    @NotNull(message = "{error.validation.customer-flat-fee-required}")
    private Long customerFlatFee;

    @NotNull(message = "{error.validation.is-active-required}")
    private Boolean isActive;

}
