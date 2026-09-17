package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findByEventId(Long eventId);

    Optional<Promotion> findByEventIdAndCodeIgnoreCase(Long eventId, String code);

    @Query("SELECT p FROM Promotion p WHERE p.eventId = :eventId " +
            "AND p.validFrom <= :now AND p.validUntil >= :now AND p.usedCount < p.usageLimit")
    List<Promotion> findActiveByEventId(@Param("eventId") Long eventId, @Param("now") Instant now);

    boolean existsByEventIdAndCodeIgnoreCase(Long eventId, String code);

}
