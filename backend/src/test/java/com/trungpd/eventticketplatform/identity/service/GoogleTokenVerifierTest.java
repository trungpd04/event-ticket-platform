package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.identity.config.GoogleProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleTokenVerifierTest {
    @Mock
    private JwtDecoder decoder;
    @Mock
    private Jwt jwt;

    private GoogleProperties properties;

    @BeforeEach
    void setUp() {
        properties = new GoogleProperties();
        properties.setClientId("client-id.apps.googleusercontent.com");
    }

    @Test
    void returnsVerifiedGoogleProfile() {
        when(decoder.decode("id-token")).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn("google-subject");
        when(jwt.getClaimAsString("email")).thenReturn("user@example.com");
        when(jwt.getClaim("email_verified")).thenReturn(true);
        when(jwt.getClaimAsString("name")).thenReturn("Test User");
        when(jwt.getClaimAsString("picture")).thenReturn("https://example.com/avatar.png");

        var result = new GoogleTokenVerifier(properties, decoder).verify("id-token");

        assertThat(result.sub()).isEqualTo("google-subject");
        assertThat(result.emailVerified()).isTrue();
        assertThat(result.email()).isEqualTo("user@example.com");
    }

    @Test
    void rejectsUnverifiedEmail() {
        when(decoder.decode("id-token")).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn("google-subject");
        when(jwt.getClaimAsString("email")).thenReturn("user@example.com");
        when(jwt.getClaim("email_verified")).thenReturn(false);

        assertThatThrownBy(() -> new GoogleTokenVerifier(properties, decoder).verify("id-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("error.auth.google-token-invalid");
    }

    @Test
    void hidesDecoderFailureBehindGenericError() {
        when(decoder.decode("bad-token")).thenThrow(new JwtException("signature details"));

        assertThatThrownBy(() -> new GoogleTokenVerifier(properties, decoder).verify("bad-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("error.auth.google-token-invalid");
    }
}
