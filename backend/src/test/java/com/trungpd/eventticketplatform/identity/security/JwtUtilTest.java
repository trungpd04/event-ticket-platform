package com.trungpd.eventticketplatform.identity.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil("test-secret-key-at-least-32-characters-long", 900000, 604800000);
    }

    @Test
    void shouldGenerateAndValidateAccessToken() {
        String token = jwtUtil.generateAccessToken(1L, Set.of("CUSTOMER", "ORGANIZER"));

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
        assertThat(jwtUtil.extractSubject(token)).isEqualTo(1L);
        assertThat(jwtUtil.extractRoles(token)).containsExactlyInAnyOrder("CUSTOMER", "ORGANIZER");
        assertThat(jwtUtil.extractTokenType(token)).isEqualTo("access");
        assertThat(jwtUtil.isAccessToken(token)).isTrue();
        assertThat(jwtUtil.isRefreshToken(token)).isFalse();
    }

    @Test
    void shouldGenerateAndValidateRefreshToken() {
        UUID familyId = UUID.randomUUID();
        String token = jwtUtil.generateRefreshToken(1L, familyId);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
        assertThat(jwtUtil.extractSubject(token)).isEqualTo(1L);
        assertThat(jwtUtil.extractRoles(token)).isEmpty();
        assertThat(jwtUtil.extractTokenType(token)).isEqualTo("refresh");
        assertThat(jwtUtil.extractFamilyId(token)).isEqualTo(familyId);
        assertThat(jwtUtil.extractJti(token)).isNotBlank();
        assertThat(jwtUtil.isRefreshToken(token)).isTrue();
        assertThat(jwtUtil.isAccessToken(token)).isFalse();
    }

    @Test
    void shouldInvalidateMalformedToken() {
        assertThat(jwtUtil.isTokenValid("invalid-token")).isFalse();
    }

}
