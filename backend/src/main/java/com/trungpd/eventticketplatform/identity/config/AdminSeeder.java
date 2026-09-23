package com.trungpd.eventticketplatform.identity.config;

import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import com.trungpd.eventticketplatform.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${seeder.admin.enabled:false}")
    private boolean enabled;

    @Value("${seeder.admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${seeder.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${seeder.admin.full-name:System Admin}")
    private String adminFullName;

    @Override
    public void run(String... args) {
        if (!enabled) {
            return;
        }

        if (!StringUtils.hasText(adminPassword)) {
            log.warn("Admin seeder is enabled but password is empty. Skipping.");
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin account already exists: {}", adminEmail);
            return;
        }

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setFullName(adminFullName);
        admin.setRoles(Set.of(Role.ADMIN));
        admin.setStatus(UserStatus.ACTIVE);

        userRepository.save(admin);
        log.info("Admin account created: {}", adminEmail);
    }

}
