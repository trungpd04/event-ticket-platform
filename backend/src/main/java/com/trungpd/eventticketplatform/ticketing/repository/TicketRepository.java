package com.trungpd.eventticketplatform.ticketing.repository;

import com.trungpd.eventticketplatform.ticketing.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Modifying
    @Query(value = """
            UPDATE tickets
            SET status = 'RESERVED',
                reserved_until = :reservedUntil,
                order_detail_id = :orderDetailId
            WHERE id IN (
                SELECT id
                FROM tickets
                WHERE ticket_type_id = :ticketTypeId
                  AND event_id = :eventId
                  AND (status = 'AVAILABLE' OR (status = 'RESERVED' AND reserved_until < NOW()))
                ORDER BY id
                LIMIT :quantity
                FOR UPDATE SKIP LOCKED
            )
            RETURNING *
            """, nativeQuery = true)
    List<Ticket> reserveTickets(
            @Param("ticketTypeId") Long ticketTypeId,
            @Param("eventId") Long eventId,
            @Param("quantity") int quantity,
            @Param("reservedUntil") LocalDateTime reservedUntil,
            @Param("orderDetailId") Long orderDetailId
    );

    @Modifying
    @Query("""
            UPDATE Ticket t
            SET t.status = 'AVAILABLE',
                t.reservedUntil = NULL,
                t.orderDetailId = NULL
            WHERE t.orderDetailId = :orderDetailId AND t.status = 'RESERVED'
            """)
    int releaseTicketsByOrderDetailId(@Param("orderDetailId") Long orderDetailId);

    Optional<Ticket> findByIdAndEventId(Long id, Long eventId);

    long countByTicketTypeIdAndStatus(Long ticketTypeId, com.trungpd.eventticketplatform.ticketing.enums.TicketStatus status);

    @Query(value = """
            SELECT COUNT(*) FROM tickets
            WHERE ticket_type_id = :ticketTypeId
              AND event_id = :eventId
              AND (status = 'AVAILABLE' OR (status = 'RESERVED' AND reserved_until < NOW()))
            """, nativeQuery = true)
    int countTakeable(@Param("ticketTypeId") Long ticketTypeId, @Param("eventId") Long eventId);

    List<Ticket> findByOrderDetailIdIn(List<Long> orderDetailIds);

    @Modifying
    @Query("UPDATE Ticket t SET t.status = com.trungpd.eventticketplatform.ticketing.enums.TicketStatus.PAID, t.reservedUntil = NULL WHERE t.orderDetailId IN :ids AND t.status = com.trungpd.eventticketplatform.ticketing.enums.TicketStatus.RESERVED")
    int markPaidByOrderDetailIds(@Param("ids") List<Long> ids);

    @Modifying
    @Query("UPDATE Ticket t SET t.status = com.trungpd.eventticketplatform.ticketing.enums.TicketStatus.AVAILABLE, t.reservedUntil = NULL, t.orderDetailId = NULL WHERE t.orderDetailId IN :ids AND t.status = com.trungpd.eventticketplatform.ticketing.enums.TicketStatus.RESERVED")
    int releaseTicketsByOrderDetailIds(@Param("ids") List<Long> ids);

}
