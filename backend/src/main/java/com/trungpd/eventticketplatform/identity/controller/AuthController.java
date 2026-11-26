package com.trungpd.eventticketplatform.identity.controller;

import com.trungpd.eventticketplatform.common.response.ApiResponse;
import com.trungpd.eventticketplatform.identity.config.AuthCookieProperties;
import com.trungpd.eventticketplatform.identity.dto.request.*;
import com.trungpd.eventticketplatform.identity.dto.response.AuthResponse;
import com.trungpd.eventticketplatform.identity.dto.response.TokenResponse;
import com.trungpd.eventticketplatform.identity.dto.response.UserResponse;
import com.trungpd.eventticketplatform.identity.security.CsrfCookieFilter;
import com.trungpd.eventticketplatform.identity.service.IAuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "API xác thực người dùng")
public class AuthController {
    private final IAuthService authService;
    private final AuthCookieProperties cookieProperties;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                            HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        AuthResponse response = authService.login(request, userAgent(httpRequest), clientIp(httpRequest));
        prepareTokenResponse(response, httpRequest, httpResponse);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> google(@Valid @RequestBody GoogleLoginRequest request,
                                                             HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        AuthResponse response = authService.googleLogin(request, userAgent(httpRequest), clientIp(httpRequest));
        prepareTokenResponse(response, httpRequest, httpResponse);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@RequestBody(required = false) RefreshTokenRequest request,
                                                               HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String token = resolveRefreshToken(httpRequest, request == null ? null : request.getRefreshToken());
        TokenResponse response = authService.refreshToken(token, userAgent(httpRequest), clientIp(httpRequest));
        if (!isBodyTransport(httpRequest)) {
            addRefreshCookie(httpResponse, response.getRefreshToken(), response.getRefreshExpiresIn());
            response.setRefreshToken(null);
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) LogoutRequest request,
                                                     HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        authService.logout(resolveRefreshToken(httpRequest, request == null ? null : request.getRefreshToken()));
        clearRefreshCookie(httpResponse);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/logout-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logoutAll(@AuthenticationPrincipal Long userId, HttpServletResponse response) {
        authService.logoutAll(userId);
        clearRefreshCookie(response);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/csrf")
    public ResponseEntity<ApiResponse<Map<String, String>>> csrf(HttpServletRequest request) {
        String token = (String) request.getAttribute(CsrfCookieFilter.CSRF_ATTRIBUTE);
        return ResponseEntity.ok(ApiResponse.success(Map.of("token", token)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("success.otp.sent", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("success.otp.valid", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("success.password.reset", null));
    }

    private void prepareTokenResponse(AuthResponse response, HttpServletRequest request, HttpServletResponse httpResponse) {
        if (!isBodyTransport(request)) {
            addRefreshCookie(httpResponse, response.getRefreshToken(), response.getRefreshExpiresIn());
            response.setRefreshToken(null);
        }
    }

    private void addRefreshCookie(HttpServletResponse response, String token, long maxAgeMillis) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(cookieProperties.getName(), token)
                .httpOnly(true).secure(cookieProperties.isSecure()).sameSite(cookieProperties.getSameSite())
                .path(cookieProperties.getPath()).maxAge(Duration.ofMillis(maxAgeMillis));
        if (StringUtils.hasText(cookieProperties.getDomain())) builder.domain(cookieProperties.getDomain());
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(cookieProperties.getName(), "")
                .httpOnly(true).secure(cookieProperties.isSecure()).sameSite(cookieProperties.getSameSite())
                .path(cookieProperties.getPath()).maxAge(Duration.ZERO);
        if (StringUtils.hasText(cookieProperties.getDomain())) builder.domain(cookieProperties.getDomain());
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }

    private String resolveRefreshToken(HttpServletRequest request, String bodyToken) {
        if (request.getCookies() != null) {
            String cookieToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> cookieProperties.getName().equals(cookie.getName()))
                    .map(Cookie::getValue).findFirst().orElse(null);
            if (StringUtils.hasText(cookieToken)) return cookieToken;
        }
        return bodyToken;
    }

    private boolean isBodyTransport(HttpServletRequest request) {
        return "body".equalsIgnoreCase(request.getHeader("X-Token-Transport"));
    }

    private String userAgent(HttpServletRequest request) { return request.getHeader(HttpHeaders.USER_AGENT); }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return StringUtils.hasText(forwarded) ? forwarded.split(",", 2)[0].trim() : request.getRemoteAddr();
    }
}
