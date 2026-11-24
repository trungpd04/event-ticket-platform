package com.trungpd.eventticketplatform.events.specification;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.enums.TimeFilter;
import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
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
     * Public event ordering: events that are currently happening or about to happen
     * are shown first. Within each time bucket, events with active ticket sales
     * rank higher, followed by upcoming sales and closed sales. Tie-breakers put
     * the nearest start time first.
     */
    public static Specification<Event> prioritizePublicEvents(LocalDateTime now) {
        return (root, query, cb) -> {
            // Spring Data also uses the specification for the count query. An
            // ORDER BY is only valid for the actual event query.
            if (!Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())) {
                Expression<Integer> timePriority = cb.<Integer>selectCase()
                        .when(
                                cb.and(
                                        cb.lessThanOrEqualTo(root.get("startTime"), now),
                                        cb.greaterThanOrEqualTo(root.get("endTime"), now)
                                ),
                                0
                        )
                        .when(cb.greaterThan(root.get("startTime"), now), 1)
                        .otherwise(2);

                Expression<Integer> salePriority = cb.<Integer>selectCase()
                        .when(
                                cb.and(
                                        cb.lessThanOrEqualTo(root.get("ticketSaleStartTime"), now),
                                        cb.greaterThanOrEqualTo(root.get("ticketSaleEndTime"), now)
                                ),
                                0
                        )
                        .when(cb.greaterThan(root.get("ticketSaleStartTime"), now), 1)
                        .otherwise(2);

                query.orderBy(
                        cb.asc(timePriority),
                        cb.asc(salePriority),
                        cb.asc(root.get("startTime")),
                        cb.asc(root.get("ticketSaleStartTime"))
                );
            }
            return cb.conjunction();
        };
    }

    /**
     * Hide events that ended too long ago from public listings.
     */
    public static Specification<Event> endedWithinDays(LocalDateTime now, int days) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(
                root.get("endTime"), now.minusDays(days));
    }

    public static Specification<Event> hasTitle(String title) {
        return (root, query, cb) -> {
            String pattern = "%" + title.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("title")), pattern);
        };
    }

    public static Specification<Event> startTimeGreaterThan(LocalDateTime now) {
        return (root, query, cb) -> cb.greaterThan(root.get("startTime"), now);
    }

    public static Specification<Event> ticketSaleEndTimeGreaterThan(LocalDateTime now) {
        return (root, query, cb) -> cb.greaterThan(root.get("ticketSaleEndTime"), now);
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

    public static Specification<Event> hasMinPrice(Long minPrice) {
        return (root, query, cb) -> {
            Subquery<Long> sq = query.subquery(Long.class);
            Root<TicketType> ticket = sq.from(TicketType.class);
            sq.select(cb.min(ticket.get("price")));
            sq.where(cb.equal(ticket.get("eventId"), root.get("id")));
            return cb.greaterThanOrEqualTo(sq, minPrice);
        };
    }

    public static Specification<Event> hasMaxPrice(Long maxPrice) {
        return (root, query, cb) -> {
            Subquery<Long> sq = query.subquery(Long.class);
            Root<TicketType> ticket = sq.from(TicketType.class);
            sq.select(cb.min(ticket.get("price")));
            sq.where(cb.equal(ticket.get("eventId"), root.get("id")));
            return cb.lessThanOrEqualTo(sq, maxPrice);
        };
    }

}
