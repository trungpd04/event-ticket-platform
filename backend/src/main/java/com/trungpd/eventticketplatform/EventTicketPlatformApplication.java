package com.trungpd.eventticketplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@EnableCaching
public class EventTicketPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventTicketPlatformApplication.class, args);
    }

}
