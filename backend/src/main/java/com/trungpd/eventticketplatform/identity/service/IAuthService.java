package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.identity.dto.request.ForgotPasswordRequest;
import com.trungpd.eventticketplatform.identity.dto.request.LoginRequest;
import com.trungpd.eventticketplatform.identity.dto.request.RefreshTokenRequest;
import com.trungpd.eventticketplatform.identity.dto.request.RegisterRequest;
import com.trungpd.eventticketplatform.identity.dto.request.ResetPasswordRequest;
import com.trungpd.eventticketplatform.identity.dto.request.VerifyOtpRequest;
import com.trungpd.eventticketplatform.identity.dto.response.AuthResponse;
import com.trungpd.eventticketplatform.identity.dto.response.TokenResponse;
import com.trungpd.eventticketplatform.identity.dto.response.UserResponse;

public interface IAuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    TokenResponse refreshToken(RefreshTokenRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void verifyOtp(VerifyOtpRequest request);

    void resetPassword(ResetPasswordRequest request);
}
