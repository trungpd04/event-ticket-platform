package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByCustomerIdAndEventId(Long customerId, Long eventId);

    boolean existsByCustomerIdAndEventId(Long customerId, Long eventId);

    @Query("SELECT e FROM Event e JOIN Favorite f ON e.id = f.eventId WHERE f.customerId = :customerId")
    Page<Event> findFavoriteEventsByCustomerId(@Param("customerId") Long customerId, Pageable pageable);

}
