package com.trungpd.eventticketplatform.events.job;

import com.trungpd.eventticketplatform.events.service.IEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventStartScheduler {

    private final IEventService eventService;

    @Scheduled(cron = "0 */1 * * * *")
    @Transactional
    public void startOngoingEvents() {
        int count = eventService.startOngoingEvents();
        if (count > 0) {
            log.info("Scheduler moved {} event(s) from PUBLISHED to ONGOING", count);
        }
    }
}
