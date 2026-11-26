package com.trungpd.eventticketplatform.identity.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    @Getter
    private final long accessTokenExpiration;
    @Getter
    private final long refreshTokenExpiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration:900000}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration:604800000}") long refreshTokenExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(Long userId, Collection<String> roles) {
        return buildToken(userId, roles, "access", null, accessTokenExpiration);
    }

    public String generateRefreshToken(Long userId, UUID familyId) {
        return buildToken(userId, Collections.emptyList(), "refresh", familyId, refreshTokenExpiration);
    }

    private String buildToken(Long userId, Collection<String> roles, String type, UUID familyId, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        var builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(expiryDate)
                .claim("roles", roles)
                .claim("typ", type)
                .claim("familyId", familyId == null ? null : familyId.toString())
                .signWith(secretKey);

        return builder.compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractSubject(String token) {
        return Long.valueOf(extractClaims(token).getSubject());
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return extractClaims(token).get("roles", List.class);
    }

    public String extractTokenType(String token) {
        return extractClaims(token).get("typ", String.class);
    }

    public String extractJti(String token) {
        return extractClaims(token).getId();
    }

    public UUID extractFamilyId(String token) {
        String familyId = extractClaims(token).get("familyId", String.class);
        return familyId == null ? null : UUID.fromString(familyId);
    }

    public Date extractExpiration(String token) {
        return extractClaims(token).getExpiration();
    }

    public boolean isAccessToken(String token) {
        String type = extractTokenType(token);
        if ("access".equals(type)) {
            return true;
        }
        List<String> roles = extractRoles(token);
        return type == null && roles != null && !roles.isEmpty();
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(extractTokenType(token));
    }

    public boolean isTokenValid(String token) {
        try {
            Date expiration = extractClaims(token).getExpiration();
            return expiration.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

}
