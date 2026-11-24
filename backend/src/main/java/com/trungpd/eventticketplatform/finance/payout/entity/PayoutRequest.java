package com.trungpd.eventticketplatform.finance.payout.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import com.trungpd.eventticketplatform.finance.payout.PayoutStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "payout_requests")
@Getter
@Setter
@NoArgsConstructor
public class PayoutRequest extends BaseEntity {

    @Column(name = "organizer_id", nullable = false)
    private Long organizerId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "request_code", nullable = false, unique = true, length = 50)
    private String requestCode;

    @Column(name = "gross_ticket_amount", nullable = false)
    private Long grossTicketAmount = 0L;

    @Column(name = "discount_amount", nullable = false)
    private Long discountAmount = 0L;

    @Column(name = "gross_revenue", nullable = false)
    private Long grossRevenue = 0L;

    @Column(name = "platform_fee", nullable = false)
    private Long platformFee = 0L;

    @Column(name = "commission_fee", nullable = false)
    private Long commissionFee = 0L;

    @Column(name = "net_revenue", nullable = false)
    private Long netRevenue = 0L;

    @Column(name = "approved_net_amount")
    private Long approvedNetAmount;

    @Column(name = "order_count", nullable = false)
    private Integer orderCount = 0;

    @Column(name = "event_end_time_snapshot")
    private LocalDateTime eventEndTimeSnapshot;

    @Column(name = "hold_until")
    private LocalDateTime holdUntil;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "account_holder")
    private String accountHolder;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PayoutStatus status = PayoutStatus.PENDING;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "proof_file_id")
    private Long proofFileId;

    @Column(name = "transaction_ref", length = 255)
    private String transactionRef;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

}
