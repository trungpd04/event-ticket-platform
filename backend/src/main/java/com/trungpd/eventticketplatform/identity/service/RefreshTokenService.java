package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.common.exception.UnauthorizedException;
import com.trungpd.eventticketplatform.identity.entity.RefreshToken;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import com.trungpd.eventticketplatform.identity.repository.RefreshTokenRepository;
import com.trungpd.eventticketplatform.identity.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefreshTokenService implements IRefreshTokenService {

    private static final String INVALID_TOKEN = "error.auth.invalid-token";

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public TokenPair issue(User user, String userAgent, String ipAddress) {
        return issueInFamily(user, UUID.randomUUID(), userAgent, ipAddress);
    }

    @Override
    @Transactional
    public TokenPair rotate(String rawToken, String userAgent, String ipAddress) {
        if (rawToken == null || !jwtUtil.isTokenValid(rawToken) || !jwtUtil.isRefreshToken(rawToken)) {
            throw new UnauthorizedException(INVALID_TOKEN);
        }

        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException(INVALID_TOKEN));

        if (stored.getRevokedAt() != null) {
            refreshTokenRepository.revokeFamily(stored.getFamilyId(), LocalDateTime.now(), "REUSE_DETECTED");
            throw new UnauthorizedException("error.auth.refresh-token-reused");
        }

        LocalDateTime now = LocalDateTime.now();
        User user = stored.getUser();
        UUID tokenFamily = jwtUtil.extractFamilyId(rawToken);
        if (stored.getExpiresAt().isBefore(now)
                || !stored.getFamilyId().equals(tokenFamily)
                || !user.getId().equals(jwtUtil.extractSubject(rawToken))) {
            throw new UnauthorizedException(INVALID_TOKEN);
        }
        if (user.getStatus() == UserStatus.BANNED) {
            refreshTokenRepository.revokeFamily(stored.getFamilyId(), now, "USER_BANNED");
            throw new UnauthorizedException("error.user.banned");
        }

        stored.setRevokedAt(now);
        stored.setRevokedReason("ROTATED");
        refreshTokenRepository.save(stored);
        return issueInFamily(user, stored.getFamilyId(), userAgent, ipAddress);
    }

    @Override
    @Transactional
    public void revoke(String rawToken, String reason) {
        if (rawToken == null) {
            return;
        }
        refreshTokenRepository.findByTokenHash(hash(rawToken)).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(LocalDateTime.now());
                token.setRevokedReason(reason);
                refreshTokenRepository.save(token);
            }
        });
    }

    @Override
    @Transactional
    public void revokeAll(Long userId, String reason) {
        refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now(), reason);
    }

    private TokenPair issueInFamily(User user, UUID familyId, String userAgent, String ipAddress) {
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), familyId);
        RefreshToken stored = new RefreshToken();
        stored.setUser(user);
        stored.setTokenHash(hash(refreshToken));
        stored.setFamilyId(familyId);
        stored.setExpiresAt(LocalDateTime.ofInstant(jwtUtil.extractExpiration(refreshToken).toInstant(), ZoneId.systemDefault()));
        stored.setUserAgent(truncate(userAgent, 255));
        stored.setIpAddress(truncate(ipAddress, 45));
        refreshTokenRepository.save(stored);

        Set<String> roles = user.getRoles().stream().map(Role::name).collect(Collectors.toSet());
        String accessToken = jwtUtil.generateAccessToken(user.getId(), roles);
        return new TokenPair(accessToken, refreshToken, jwtUtil.getAccessTokenExpiration(),
                jwtUtil.getRefreshTokenExpiration());
    }

    static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private String truncate(String value, int maxLength) {
        return value == null || value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
