package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.common.exception.UnauthorizedException;
import com.trungpd.eventticketplatform.identity.entity.RefreshToken;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import com.trungpd.eventticketplatform.identity.repository.RefreshTokenRepository;
import com.trungpd.eventticketplatform.identity.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {
    @Mock
    private RefreshTokenRepository repository;

    private JwtUtil jwtUtil;
    private RefreshTokenService service;
    private User user;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil("test-secret-key-at-least-32-characters-long", 900000, 604800000);
        service = new RefreshTokenService(repository, jwtUtil);
        user = new User();
        user.setId(42L);
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(Set.of(Role.CUSTOMER));
    }

    @Test
    void issueStoresOnlyHashAndCreatesTypedTokens() {
        IRefreshTokenService.TokenPair pair = service.issue(user, "agent", "127.0.0.1");

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getTokenHash()).hasSize(64).doesNotContain(pair.refreshToken());
        assertThat(jwtUtil.extractTokenType(pair.accessToken())).isEqualTo("access");
        assertThat(jwtUtil.extractTokenType(pair.refreshToken())).isEqualTo("refresh");
    }

    @Test
    void rotateRevokesOldTokenAndKeepsFamily() {
        UUID familyId = UUID.randomUUID();
        String rawToken = jwtUtil.generateRefreshToken(user.getId(), familyId);
        RefreshToken stored = storedToken(rawToken, familyId);
        when(repository.findByTokenHash(RefreshTokenService.hash(rawToken))).thenReturn(Optional.of(stored));

        IRefreshTokenService.TokenPair pair = service.rotate(rawToken, "new-agent", "10.0.0.1");

        assertThat(stored.getRevokedReason()).isEqualTo("ROTATED");
        assertThat(stored.getRevokedAt()).isNotNull();
        assertThat(jwtUtil.extractFamilyId(pair.refreshToken())).isEqualTo(familyId);
    }

    @Test
    void reuseRevokesTheWholeFamily() {
        UUID familyId = UUID.randomUUID();
        String rawToken = jwtUtil.generateRefreshToken(user.getId(), familyId);
        RefreshToken stored = storedToken(rawToken, familyId);
        stored.setRevokedAt(LocalDateTime.now().minusMinutes(1));
        when(repository.findByTokenHash(RefreshTokenService.hash(rawToken))).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> service.rotate(rawToken, null, null)).isInstanceOf(UnauthorizedException.class);
        verify(repository).revokeFamily(eq(familyId), any(LocalDateTime.class), eq("REUSE_DETECTED"));
    }

    private RefreshToken storedToken(String rawToken, UUID familyId) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setFamilyId(familyId);
        token.setTokenHash(RefreshTokenService.hash(rawToken));
        token.setExpiresAt(LocalDateTime.now().plusDays(1));
        return token;
    }
}
