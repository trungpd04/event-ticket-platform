package com.trungpd.eventticketplatform.identity.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.auth.cookie")
@Getter
@Setter
public class AuthCookieProperties {
    private String name = "refresh_token";
    private boolean secure = true;
    private String sameSite = "Strict";
    private String domain = "";
    private String path = "/api/v1/auth";
}
