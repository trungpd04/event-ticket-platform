package com.trungpd.eventticketplatform.events.job;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import com.trungpd.eventticketplatform.identity.repository.UserRepository;
import com.trungpd.eventticketplatform.identity.service.IEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PendingEventReminderScheduler {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final IEmailService emailService;

    @Value("${app.scheduler.time-zone:Asia/Ho_Chi_Minh}")
    private String schedulerTimeZone;

    @Scheduled(cron = "0 0 8 * * *", zone = "${app.scheduler.time-zone:Asia/Ho_Chi_Minh}")
    @Transactional(readOnly = true)
    public void sendPendingEventReminders() {
        List<Event> pendingEvents = eventRepository.findByStatusAndTicketSaleStartTimeAfter(
                EventStatus.PENDING_REVIEW, LocalDateTime.now(ZoneId.of(schedulerTimeZone)));

        if (pendingEvents.isEmpty()) {
            return;
        }

        List<User> admins = userRepository.findByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
        if (admins.isEmpty()) {
            log.warn("There are {} pending event(s), but no active admin recipient was found", pendingEvents.size());
            return;
        }

        String content = buildReminderContent(pendingEvents);
        admins.forEach(admin -> emailService.sendPendingEventReminderEmail(admin.getEmail(), content));
        log.info("Sent pending event approval reminder for {} event(s) to {} admin(s)", pendingEvents.size(), admins.size());
    }

    private String buildReminderContent(List<Event> events) {
        StringBuilder content = new StringBuilder("<p>Các sự kiện sau chưa được duyệt và sắp đến thời gian mở bán:</p><ul>");
        events.forEach(event -> content.append("<li><strong>")
                .append(escapeHtml(event.getTitle()))
                .append("</strong> - mở bán lúc ")
                .append(event.getTicketSaleStartTime().format(DATE_TIME_FORMATTER))
                .append("</li>"));
        return content.append("</ul><p>Vui lòng kiểm tra và xử lý trên trang quản trị.</p>").toString();
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value.replace("&", "&amp;")
                .replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
