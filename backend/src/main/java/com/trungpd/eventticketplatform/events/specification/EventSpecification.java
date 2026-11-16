package com.trungpd.eventticketplatform.events.specification;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.enums.TimeFilter;
import jakarta.persistence.criteria.Expression;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Collection;

public class EventSpecification {

    public static Specification<Event> hasStatus(EventStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Event> hasStatusIn(Collection<EventStatus> statuses) {
        return (root, query, cb) -> root.get("status").in(statuses);
    }

    /**
     * Public event ordering: active ticket sales first, upcoming sales next,
     * and events whose ticket sales have ended last.
     */
    public static Specification<Event> prioritizeTicketSales(LocalDateTime now) {
        return (root, query, cb) -> {
            // Spring Data also uses the specification for the count query. An
            // ORDER BY is only valid for the actual event query.
            if (!Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())) {
                Expression<Integer> salePriority = cb.<Integer>selectCase()
                        .when(
                                cb.and(
                                        cb.lessThanOrEqualTo(root.get("ticketSaleStartTime"), now),
                                        cb.greaterThanOrEqualTo(root.get("ticketSaleEndTime"), now)
                                ),
                                0
                        )
                        .when(cb.lessThan(root.get("ticketSaleEndTime"), now), 2)
                        .otherwise(1);

                query.orderBy(
                        cb.asc(salePriority),
                        cb.asc(root.get("ticketSaleStartTime")),
                        cb.asc(root.get("startTime"))
                );
            }
            return cb.conjunction();
        };
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

    public static Specification<Event> startTimeGreaterThanOrEqual(LocalDateTime fromDate) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("startTime"), fromDate);
    }

    public static Specification<Event> startTimeLessThanOrEqual(LocalDateTime toDate) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("startTime"), toDate);
    }

    public static Specification<Event> hasTimeFilter(TimeFilter timeFilter) {
        return (root, query, cb) -> {
            LocalDateTime now = LocalDateTime.now();
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
