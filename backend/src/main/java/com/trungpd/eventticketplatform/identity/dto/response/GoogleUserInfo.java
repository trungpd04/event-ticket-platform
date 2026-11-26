package com.trungpd.eventticketplatform.identity.dto.response;

public record GoogleUserInfo(
        String sub,
        String email,
        boolean emailVerified,
        String name,
        String picture) {
}
