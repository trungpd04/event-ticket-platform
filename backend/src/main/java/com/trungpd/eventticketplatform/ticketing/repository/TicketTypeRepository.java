package com.trungpd.eventticketplatform.ticketing.repository;

import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {

    List<TicketType> findByEventId(Long eventId);

    boolean existsByEventIdAndTotalQuantityGreaterThan(Long eventId, Integer quantity);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT tt FROM TicketType tt WHERE tt.id = :id")
    Optional<TicketType> findByIdForUpdate(@Param("id") Long id);

    @Modifying
    @Query("""
            UPDATE TicketType tt
            SET tt.availableQuantity = tt.availableQuantity - :quantity
            WHERE tt.id = :id AND tt.availableQuantity >= :quantity
            """)
    int decrementAvailableQuantity(@Param("id") Long id, @Param("quantity") int quantity);

}
