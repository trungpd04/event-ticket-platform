package com.trungpd.eventticketplatform.orders.dto.request;

import lombok.Data;

@Data
public class MockPaymentRequest {
    private String paymentMethod = "MOCK_VNPAY";
    private String returnMessage;
}
