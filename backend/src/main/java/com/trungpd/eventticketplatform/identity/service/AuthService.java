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
import com.trungpd.eventticketplatform.identity.security.JwtUtil;
import com.trungpd.eventticketplatform.identity.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final EmailService emailService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("error.user.email-exists");
        }

        if (request.getRole() == Role.ADMIN || request.getRole() == Role.CHECKER) {
            throw new BusinessException("error.user.invalid-role");
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("error.auth.invalid-credentials"));

        if (user.getStatus() == UserStatus.BANNED) {
            throw new BusinessException("error.user.banned");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("error.auth.invalid-credentials");
        }

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new BusinessException("error.auth.invalid-token");
        }

        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("error.auth.invalid-token"));

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration())
                .build();
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

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration())
                .build();
    }

}
