package com.trungpd.eventticketplatform.common.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Temporary config to repair Flyway checksum mismatch.
 * Remove this bean after the deployment succeeds.
 */
@Configuration
@Profile({"test", "heroku"})
public class FlywayRepairConfig {

    @Bean
    public FlywayMigrationStrategy cleanRepairMigrateStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }

}
