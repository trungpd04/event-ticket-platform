package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.EventUpdateRequest;
import com.trungpd.eventticketplatform.events.entity.EventUpdateRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventUpdateRequestRepository extends JpaRepository<EventUpdateRequest, Long> {

    Page<EventUpdateRequest> findByStatus(EventUpdateRequestStatus status, Pageable pageable);

    List<EventUpdateRequest> findByEventIdAndStatus(Long eventId, EventUpdateRequestStatus status);

    Optional<EventUpdateRequest> findByIdAndStatus(Long id, EventUpdateRequestStatus status);

}
