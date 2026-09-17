package com.trungpd.eventticketplatform.events.specification;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public class EventSpecification {

    public static Specification<Event> hasStatus(EventStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Event> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("location")), pattern)
            );
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

}
