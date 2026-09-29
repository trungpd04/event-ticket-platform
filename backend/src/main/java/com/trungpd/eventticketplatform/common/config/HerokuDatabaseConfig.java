package com.trungpd.eventticketplatform.common.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Profile("heroku")
public class HerokuDatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String jdbcUrl = System.getenv("JDBC_DATABASE_URL");
        String databaseUrl = System.getenv("DATABASE_URL");

        if (StringUtils.hasText(jdbcUrl)) {
            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        }

        if (!StringUtils.hasText(databaseUrl)) {
            throw new IllegalStateException("DATABASE_URL environment variable is required for Heroku profile");
        }

        if (databaseUrl.startsWith("jdbc:")) {
            return DataSourceBuilder.create()
                    .url(databaseUrl)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        }

        return buildFromUri(databaseUrl);
    }

    private DataSource buildFromUri(String databaseUrl) {
        try {
            URI dbUri = new URI(databaseUrl);
            String userInfo = dbUri.getUserInfo();
            if (userInfo == null || !userInfo.contains(":")) {
                throw new IllegalArgumentException("DATABASE_URL must contain username and password");
            }

            String[] credentials = userInfo.split(":");
            String username = credentials[0];
            String password = credentials.length > 1 ? credentials[1] : "";

            String host = dbUri.getHost();
            int port = dbUri.getPort();
            String path = dbUri.getPath();

            String jdbcUrl = "jdbc:postgresql://" + host
                    + (port == -1 ? "" : ":" + port)
                    + path
                    + "?sslmode=require";

            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse DATABASE_URL: " + databaseUrl, e);
        }
    }

}
