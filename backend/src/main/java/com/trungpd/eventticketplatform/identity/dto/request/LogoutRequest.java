package com.trungpd.eventticketplatform.identity.dto.request;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}
