package com.trungpd.eventticketplatform.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.stream.Collectors;

@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final int MAX_BODY_LENGTH = 1000;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            logRequest(requestWrapper);
            logResponse(responseWrapper, duration);

            responseWrapper.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = getClientIp(request);
        String headers = getHeadersAsString(request);
        String body = getRequestBody(request);

        StringBuilder sb = new StringBuilder();
        sb.append("\n========== [REQUEST] ==========");
        sb.append("\n  Method: ").append(method);
        sb.append("\n  URL: ").append(uri);
        sb.append("\n  Query: ").append(queryString != null ? queryString : "N/A");
        sb.append("\n  Client IP: ").append(clientIp);
        sb.append("\n  Headers: ").append(headers.isEmpty() ? "N/A" : headers);
        sb.append("\n  Body: ").append(body.isEmpty() ? "N/A" : "\n" + indent(body));
        sb.append("\n===============================");

        log.info(sb.toString());
    }

    private void logResponse(ContentCachingResponseWrapper response, long duration) {
        int status = response.getStatus();
        String body = getResponseBody(response);

        StringBuilder sb = new StringBuilder();
        sb.append("\n========== [RESPONSE] ==========");
        sb.append("\n  Status: ").append(status);
        sb.append("\n  Duration: ").append(duration).append("ms");
        sb.append("\n  Body: ").append(body.isEmpty() ? "N/A" : "\n" + indent(body));
        sb.append("\n================================");

        log.info(sb.toString());
    }

    private String getClientIp(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "X-Real-IP",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "REMOTE_ADDR"
        };

        for (String header : headers) {
            String value = request.getHeader(header);
            if (value != null && !value.isEmpty() && !"unknown".equalsIgnoreCase(value)) {
                return value.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }

    private String getHeadersAsString(HttpServletRequest request) {
        return Collections.list(request.getHeaderNames())
                .stream()
                .map(headerName -> headerName + "=" + request.getHeader(headerName))
                .collect(Collectors.joining(", "));
    }

    private String getRequestBody(ContentCachingRequestWrapper request) {
        byte[] content = request.getContentAsByteArray();
        if (content.length == 0) {
            return "";
        }
        return truncateBody(new String(content, StandardCharsets.UTF_8));
    }

    private String getResponseBody(ContentCachingResponseWrapper response) {
        byte[] content = response.getContentAsByteArray();
        if (content.length == 0) {
            return "";
        }
        return truncateBody(new String(content, StandardCharsets.UTF_8));
    }

    private String truncateBody(String body) {
        if (body == null || body.isEmpty()) {
            return "";
        }
        if (body.length() > MAX_BODY_LENGTH) {
            return body.substring(0, MAX_BODY_LENGTH) + "... [truncated]";
        }
        return body;
    }

    private String indent(String text) {
        String[] lines = text.split("\n");
        StringBuilder indented = new StringBuilder();
        for (String line : lines) {
            indented.append("    ").append(line).append("\n");
        }
        return indented.toString().trim();
    }

}
