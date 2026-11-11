package com.trungpd.eventticketplatform.ticketing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.orders.entity.Order;
import com.trungpd.eventticketplatform.ticketing.dto.TicketQrPayload;
import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketQrService {

    private static final String QR_VERSION = "1";
    private static final int SECRET_KEY_BYTES = 32;
    private static final int JTI_BYTES = 16;

    private final ObjectMapper objectMapper;

    public String generateSecretKey() {
        byte[] bytes = new byte[SECRET_KEY_BYTES];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String generate(Ticket ticket, Order order, Event event) {
        if (event.getSecretKey() == null || event.getSecretKey().isBlank()) {
            throw new BusinessException("error.event.secret-key-missing");
        }

        SecretKey key = resolveKey(event.getSecretKey());
        String jti = generateJti();
        Instant now = Instant.now();
        Instant expiration = event.getEndTime()
                .atZone(ZoneId.systemDefault())
                .toInstant();

        return Jwts.builder()
                .subject(String.valueOf(ticket.getId()))
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .claim("v", Integer.parseInt(QR_VERSION))
                .claim("eid", event.getId())
                .claim("ttid", ticket.getTicketTypeId())
                .claim("oid", order.getId())
                .claim("odid", ticket.getOrderDetailId())
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public Long parseEventId(String token) {
        String payload = extractPayloadJson(token);
        try {
            JsonNode node = objectMapper.readTree(payload);
            JsonNode eid = node.get("eid");
            if (eid == null || !eid.isNumber()) {
                throw new BusinessException("error.checkin.invalid-qr");
            }
            return eid.asLong();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to parse QR payload", e);
            throw new BusinessException("error.checkin.invalid-qr");
        }
    }

    public TicketQrPayload verify(String token, Event event) {
        if (event.getSecretKey() == null || event.getSecretKey().isBlank()) {
            throw new BusinessException("error.event.secret-key-missing");
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(resolveKey(event.getSecretKey()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return toPayload(claims);
        } catch (ExpiredJwtException e) {
            log.warn("QR token expired for event {}", event.getId());
            throw new BusinessException("error.checkin.event-not-ongoing");
        } catch (Exception e) {
            log.warn("Invalid QR signature for event {}", event.getId(), e);
            throw new BusinessException("error.checkin.invalid-signature");
        }
    }

    public boolean looksLikeJwt(String qrCode) {
        return qrCode != null && qrCode.startsWith("eyJ") && qrCode.chars().filter(ch -> ch == '.').count() == 2;
    }

    private SecretKey resolveKey(String base64Secret) {
        return Keys.hmacShaKeyFor(Base64.getUrlDecoder().decode(addBase64Padding(base64Secret)));
    }

    private String extractPayloadJson(String token) {
        if (token == null || token.isBlank()) {
            throw new BusinessException("error.checkin.invalid-qr");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new BusinessException("error.checkin.invalid-qr");
        }
        try {
            String padded = addBase64Padding(parts[1]);
            return new String(Base64.getUrlDecoder().decode(padded));
        } catch (Exception e) {
            log.warn("Failed to decode QR payload", e);
            throw new BusinessException("error.checkin.invalid-qr");
        }
    }

    private String addBase64Padding(String value) {
        int padding = (4 - (value.length() % 4)) % 4;
        return value + "=".repeat(padding);
    }

    private String generateJti() {
        byte[] bytes = new byte[JTI_BYTES];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private TicketQrPayload toPayload(Claims claims) {
        return new TicketQrPayload(
                claims.get("v", Integer.class),
                Long.valueOf(claims.getSubject()),
                claims.get("eid", Long.class),
                claims.get("ttid", Long.class),
                claims.get("oid", Long.class),
                claims.get("odid", Long.class),
                claims.getIssuedAt() != null ? claims.getIssuedAt().getTime() / 1000 : null,
                claims.getExpiration() != null ? claims.getExpiration().getTime() / 1000 : null,
                claims.getId()
        );
    }
}
