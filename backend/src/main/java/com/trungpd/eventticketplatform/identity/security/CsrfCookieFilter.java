package com.trungpd.eventticketplatform.identity.security;

import com.trungpd.eventticketplatform.identity.config.AuthCookieProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CsrfCookieFilter extends OncePerRequestFilter {
    public static final String CSRF_ATTRIBUTE = "csrfToken";
    private static final String CSRF_COOKIE = "XSRF-TOKEN";
    private static final String CSRF_HEADER = "X-XSRF-TOKEN";

    private final AuthCookieProperties cookieProperties;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String csrfToken = cookieValue(request, CSRF_COOKIE);
        if (!StringUtils.hasText(csrfToken)) {
            csrfToken = UUID.randomUUID().toString();
            response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(CSRF_COOKIE, csrfToken)
                    .httpOnly(false).secure(cookieProperties.isSecure())
                    .sameSite(cookieProperties.getSameSite()).path("/")
                    .maxAge(Duration.ofDays(7)).build().toString());
        }
        request.setAttribute(CSRF_ATTRIBUTE, csrfToken);
        if (requiresCookieCsrf(request) && !csrfToken.equals(request.getHeader(CSRF_HEADER))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Invalid CSRF token\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private boolean requiresCookieCsrf(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) return false;
        String uri = request.getRequestURI();
        boolean protectedEndpoint = uri.endsWith("/api/v1/auth/refresh") || uri.endsWith("/api/v1/auth/logout");
        return protectedEndpoint && StringUtils.hasText(cookieValue(request, cookieProperties.getName()));
    }

    private String cookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        return Arrays.stream(cookies).filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue).findFirst().orElse(null);
    }
}
