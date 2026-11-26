package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.identity.dto.request.*;
import com.trungpd.eventticketplatform.identity.dto.response.AuthResponse;
import com.trungpd.eventticketplatform.identity.dto.response.TokenResponse;
import com.trungpd.eventticketplatform.identity.dto.response.UserResponse;
import com.trungpd.eventticketplatform.identity.entity.Otp;
import com.trungpd.eventticketplatform.identity.entity.OtpType;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import com.trungpd.eventticketplatform.identity.mapper.UserMapper;
import com.trungpd.eventticketplatform.identity.repository.UserRepository;
import com.trungpd.eventticketplatform.identity.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final IRefreshTokenService refreshTokenService;
    private final IGoogleTokenVerifier googleTokenVerifier;
    private final GoogleAccountProvisioner googleAccountProvisioner;
    private final IOtpService otpService;
    private final IEmailService emailService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("error.user.email-exists");
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(Set.of(Role.CUSTOMER, Role.ORGANIZER));

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String userAgent, String ipAddress) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new BusinessException("error.auth.invalid-credentials"));

        if (user.getStatus() == UserStatus.BANNED) {
            throw new BusinessException("error.user.banned");
        }

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("error.auth.invalid-credentials");
        }

        return buildAuthResponse(user, userAgent, ipAddress);
    }

    @Transactional
    public TokenResponse refreshToken(String refreshToken, String userAgent, String ipAddress) {
        IRefreshTokenService.TokenPair pair = refreshTokenService.rotate(refreshToken, userAgent, ipAddress);
        return TokenResponse.builder()
                .accessToken(pair.accessToken())
                .refreshToken(pair.refreshToken())
                .tokenType("Bearer")
                .expiresIn(pair.accessExpiresIn())
                .refreshExpiresIn(pair.refreshExpiresIn())
                .build();
    }

    public AuthResponse googleLogin(GoogleLoginRequest request, String userAgent, String ipAddress) {
        var info = googleTokenVerifier.verify(request.getIdToken());
        User user = userRepository.findByGoogleSubject(info.sub()).orElse(null);
        if (user == null) {
            if (userRepository.findByEmailIgnoreCase(info.email()).isPresent()) {
                throw new BusinessException("error.auth.google-email-exists");
            }
            try {
                user = googleAccountProvisioner.create(info);
            } catch (DataIntegrityViolationException ex) {
                user = userRepository.findByGoogleSubject(info.sub()).orElseGet(() ->
                        userRepository.findByEmailIgnoreCase(info.email())
                                .filter(existing -> info.sub().equals(existing.getGoogleSubject()))
                                .orElseThrow(() -> new BusinessException("error.auth.google-email-exists")));
            }
        }
        if (user.getStatus() == UserStatus.BANNED) {
            throw new BusinessException("error.user.banned");
        }
        return buildAuthResponse(user, userAgent, ipAddress);
    }

    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken, "LOGOUT");
    }

    public void logoutAll(Long userId) {
        refreshTokenService.revokeAll(userId, "LOGOUT_ALL");
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("error.user.not-found"));

        String code = otpService.generateOtp(user.getEmail(), OtpType.FORGOT_PASSWORD);
        emailService.sendOtpEmail(user.getEmail(), code, OtpType.FORGOT_PASSWORD.name());
    }

    @Transactional(readOnly = true)
    public void verifyOtp(VerifyOtpRequest request) {
        otpService.validateOtp(request.getEmail(), request.getCode(), request.getType());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Otp otp = otpService.validateOtp(request.getEmail(), request.getCode(), OtpType.FORGOT_PASSWORD);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("error.user.not-found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpService.markOtpAsUsed(otp);
    }

    private AuthResponse buildAuthResponse(User user, String userAgent, String ipAddress) {
        IRefreshTokenService.TokenPair pair = refreshTokenService.issue(user, userAgent, ipAddress);
        return AuthResponse.builder()
                .accessToken(pair.accessToken())
                .refreshToken(pair.refreshToken())
                .tokenType("Bearer")
                .expiresIn(pair.accessExpiresIn())
                .refreshExpiresIn(pair.refreshExpiresIn())
                .build();
    }

}
