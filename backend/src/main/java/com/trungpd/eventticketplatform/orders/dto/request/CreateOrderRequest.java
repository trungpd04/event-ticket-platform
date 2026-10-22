package com.trungpd.eventticketplatform.orders.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotBlank
    private String reservationId;
    private String promotionCode;
}
