package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.EventChecker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventCheckerRepository extends JpaRepository<EventChecker, Long> {

    boolean existsByEventIdAndCheckerId(Long eventId, Long checkerId);

    Optional<EventChecker> findByEventIdAndCheckerId(Long eventId, Long checkerId);

    List<EventChecker> findByEventId(Long eventId);

    List<EventChecker> findByCheckerId(Long checkerId);
}
