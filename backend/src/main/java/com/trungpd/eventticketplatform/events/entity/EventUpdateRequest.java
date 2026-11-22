package com.trungpd.eventticketplatform.events.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import com.trungpd.eventticketplatform.events.dto.request.PublishedEventUpdateRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_update_requests")
@Getter
@Setter
@NoArgsConstructor
public class EventUpdateRequest extends BaseEntity {

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "organizer_id", nullable = false)
    private Long organizerId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", nullable = false, columnDefinition = "jsonb")
    private PublishedEventUpdateRequest payload;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EventUpdateRequestStatus status = EventUpdateRequestStatus.PENDING_REVIEW;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

}
