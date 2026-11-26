package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.identity.entity.User;

public interface IRefreshTokenService {

    TokenPair issue(User user, String userAgent, String ipAddress);

    TokenPair rotate(String refreshToken, String userAgent, String ipAddress);

    void revoke(String refreshToken, String reason);

    void revokeAll(Long userId, String reason);

    record TokenPair(String accessToken, String refreshToken, long accessExpiresIn, long refreshExpiresIn) {
    }
}
