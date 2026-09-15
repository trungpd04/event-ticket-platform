package com.trungpd.eventticketplatform.identity.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenResponse {

    private String accessToken;
    private String tokenType;
    private Long expiresIn;

}
