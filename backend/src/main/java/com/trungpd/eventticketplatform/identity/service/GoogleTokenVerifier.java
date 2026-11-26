package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.identity.config.GoogleProperties;
import com.trungpd.eventticketplatform.identity.dto.response.GoogleUserInfo;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class GoogleTokenVerifier implements IGoogleTokenVerifier {

    private final GoogleProperties properties;
    private final JwtDecoder decoder;

    public GoogleTokenVerifier(GoogleProperties properties) {
        this(properties, createDecoder(properties));
    }

    GoogleTokenVerifier(GoogleProperties properties, JwtDecoder decoder) {
        this.properties = properties;
        this.decoder = decoder;
    }

    private static JwtDecoder createDecoder(GoogleProperties properties) {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(properties.getJwkSetUri()).build();
        OAuth2TokenValidator<Jwt> issuer = JwtValidators.createDefaultWithIssuer(properties.getIssuer());
        OAuth2TokenValidator<Jwt> audience = new JwtClaimValidator<List<String>>("aud",
                aud -> aud != null && aud.contains(properties.getClientId()));
        jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(issuer, audience));
        return jwtDecoder;
    }

    @Override
    public GoogleUserInfo verify(String idToken) {
        if (!StringUtils.hasText(properties.getClientId())) {
            throw new BusinessException("error.auth.google-not-configured");
        }
        try {
            Jwt jwt = decoder.decode(idToken);
            String subject = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            Boolean verified = jwt.getClaim("email_verified");
            if (!StringUtils.hasText(subject) || !StringUtils.hasText(email) || !Boolean.TRUE.equals(verified)) {
                throw new BusinessException("error.auth.google-token-invalid");
            }
            return new GoogleUserInfo(subject, email, true, jwt.getClaimAsString("name"),
                    jwt.getClaimAsString("picture"));
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BusinessException("error.auth.google-token-invalid");
        }
    }
}
