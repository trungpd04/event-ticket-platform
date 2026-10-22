package com.trungpd.eventticketplatform.identity.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

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
        assertThat(jwtUtil.extractSubject(token)).isEqualTo("1");
        assertThat(jwtUtil.extractRoles(token)).containsExactlyInAnyOrder("CUSTOMER", "ORGANIZER");
    }

    @Test
    void shouldGenerateAndValidateRefreshToken() {
        String token = jwtUtil.generateRefreshToken(1L);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
        assertThat(jwtUtil.extractSubject(token)).isEqualTo("1");
        assertThat(jwtUtil.extractRoles(token)).isEmpty();
    }

    @Test
    void shouldInvalidateMalformedToken() {
        assertThat(jwtUtil.isTokenValid("invalid-token")).isFalse();
    }

}
