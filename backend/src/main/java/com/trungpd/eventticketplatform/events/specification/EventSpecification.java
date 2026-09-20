package com.trungpd.eventticketplatform.events.specification;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.enums.TimeFilter;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public class EventSpecification {

    public static Specification<Event> hasStatus(EventStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Event> hasTitle(String title) {
        return (root, query, cb) -> {
            String pattern = "%" + title.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("title")), pattern);
        };
    }

    public static Specification<Event> hasLocation(String location) {
        return (root, query, cb) -> cb.equal(cb.lower(root.get("location")), location.toLowerCase());
    }

    public static Specification<Event> startTimeGreaterThanOrEqual(Instant fromDate) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("startTime"), fromDate);
    }

    public static Specification<Event> startTimeLessThanOrEqual(Instant toDate) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("startTime"), toDate);
    }

    public static Specification<Event> hasTimeFilter(TimeFilter timeFilter) {
        return (root, query, cb) -> {
            Instant now = Instant.now();
            return switch (timeFilter) {
                case UPCOMING -> cb.greaterThan(root.get("startTime"), now);
                case PAST -> cb.lessThan(root.get("endTime"), now);
                case ONGOING -> cb.and(
                        cb.lessThanOrEqualTo(root.get("startTime"), now),
                        cb.greaterThanOrEqualTo(root.get("endTime"), now)
                );
            };
        };
    }

    public static Specification<Event> hasCategory(Long categoryId) {
        return (root, query, cb) -> cb.equal(root.get("categoryId"), categoryId);
    }

    public static Specification<Event> hasProvince(Long provinceId) {
        return (root, query, cb) -> cb.equal(root.get("provinceId"), provinceId);
    }

}
