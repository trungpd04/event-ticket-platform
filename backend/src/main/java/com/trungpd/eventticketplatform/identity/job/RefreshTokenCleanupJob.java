package com.trungpd.eventticketplatform.identity.job;

import com.trungpd.eventticketplatform.identity.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupJob {
    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(cron = "0 0 3 * * *", zone = "${app.scheduler.time-zone:Asia/Ho_Chi_Minh}")
    @Transactional
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteExpired(LocalDateTime.now().minusDays(30));
    }
}
