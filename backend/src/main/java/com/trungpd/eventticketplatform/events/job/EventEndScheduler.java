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
public class EventEndScheduler {

    private final IEventService eventService;

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void closeFinishedEvents() {
        int count = eventService.finishEvents();
        if (count > 0) {
            log.info("Scheduler closed {} finished event(s)", count);
        }
    }
}
