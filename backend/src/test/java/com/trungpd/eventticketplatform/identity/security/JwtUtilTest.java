package com.trungpd.eventticketplatform.identity.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil("test-secret-key-at-least-32-characters-long", 900000, 604800000);
    }

    @Test
    void shouldGenerateAndValidateAccessToken() {
        String token = jwtUtil.generateAccessToken("test@example.com", "CUSTOMER");

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("test@example.com");
        assertThat(jwtUtil.extractRole(token)).isEqualTo("CUSTOMER");
    }

    @Test
    void shouldGenerateAndValidateRefreshToken() {
        String token = jwtUtil.generateRefreshToken("test@example.com");

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("test@example.com");
        assertThat(jwtUtil.extractRole(token)).isNull();
    }

    @Test
    void shouldInvalidateMalformedToken() {
        assertThat(jwtUtil.isTokenValid("invalid-token")).isFalse();
    }

}
