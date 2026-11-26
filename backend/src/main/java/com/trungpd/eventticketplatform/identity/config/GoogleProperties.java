package com.trungpd.eventticketplatform.identity.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.google")
@Getter
@Setter
public class GoogleProperties {
    private String clientId = "";
    private String issuer = "https://accounts.google.com";
    private String jwkSetUri = "https://www.googleapis.com/oauth2/v3/certs";
}
