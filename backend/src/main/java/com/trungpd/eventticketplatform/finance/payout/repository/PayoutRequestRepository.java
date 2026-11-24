package com.trungpd.eventticketplatform.finance.payout.repository;

import com.trungpd.eventticketplatform.finance.payout.PayoutStatus;
import com.trungpd.eventticketplatform.finance.payout.entity.PayoutRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayoutRequestRepository extends JpaRepository<PayoutRequest, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PayoutRequest p WHERE p.id = :id")
    Optional<PayoutRequest> findByIdForUpdate(@Param("id") Long id);

    Optional<PayoutRequest> findByIdempotencyKey(String idempotencyKey);

    List<PayoutRequest> findByEventIdAndStatusIn(Long eventId, Collection<PayoutStatus> statuses);

    boolean existsByEventIdAndStatusIn(Long eventId, Collection<PayoutStatus> statuses);

    Page<PayoutRequest> findByOrganizerId(Long organizerId, Pageable pageable);

    Page<PayoutRequest> findByOrganizerIdAndStatus(Long organizerId, PayoutStatus status, Pageable pageable);

    @Query("""
            SELECT p FROM PayoutRequest p
            WHERE (:status IS NULL OR p.status = :status)
              AND (:organizerId IS NULL OR p.organizerId = :organizerId)
              AND (:eventId IS NULL OR p.eventId = :eventId)
            """)
    Page<PayoutRequest> search(
            @Param("status") PayoutStatus status,
            @Param("organizerId") Long organizerId,
            @Param("eventId") Long eventId,
            Pageable pageable);

    long countByStatus(PayoutStatus status);
}
