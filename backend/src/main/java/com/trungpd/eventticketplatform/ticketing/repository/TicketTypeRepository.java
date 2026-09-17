package com.trungpd.eventticketplatform.ticketing.repository;

import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {

    List<TicketType> findByEventId(Long eventId);

    boolean existsByEventIdAndTotalQuantityGreaterThan(Long eventId, Integer quantity);

}
