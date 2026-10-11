package com.trungpd.eventticketplatform.ticketing.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import com.trungpd.eventticketplatform.ticketing.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
public class Ticket extends BaseEntity {

    @Column(name = "ticket_type_id", nullable = false)
    private Long ticketTypeId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TicketStatus status = TicketStatus.AVAILABLE;

    @Column(name = "reserved_until")
    private LocalDateTime reservedUntil;

    @Column(name = "order_detail_id")
    private Long orderDetailId;

    @Column(name = "qr_code", length = 255)
    private String qrCode;

}
