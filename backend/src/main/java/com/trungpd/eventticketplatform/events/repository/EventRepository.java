package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    Page<Event> findByOrganizerId(Long organizerId, Pageable pageable);

    Optional<Event> findByIdAndStatus(Long id, EventStatus status);

    long countByStatus(EventStatus status);

    List<Event> findByStatusAndStartTimeLessThanEqual(EventStatus status, LocalDateTime now);

    List<Event> findByStatusAndEndTimeLessThanEqual(EventStatus status, LocalDateTime now);

    List<Event> findBySecretKeyIsNull();

    @Query("SELECT e FROM Event e WHERE e.secretKey IS NULL AND e.status IN :statuses")
    List<Event> findBySecretKeyIsNullAndStatusIn(@Param("statuses") Collection<EventStatus> statuses);

}
