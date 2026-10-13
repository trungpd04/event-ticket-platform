package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.EventPayoutInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventPayoutInfoRepository extends JpaRepository<EventPayoutInfo, Long> {

    Optional<EventPayoutInfo> findByEventId(Long eventId);

}
