package com.trungpd.eventticketplatform.finance.payout.dto.response;

import com.trungpd.eventticketplatform.finance.payout.PayoutStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PayoutResponse {
    private Long id;
    private String requestCode;
    private Long eventId;
    private String eventTitle;
    private PayoutStatus status;
    private Integer orderCount;
    private Long grossTicketAmount;
    private Long discountAmount;
    private Long grossRevenue;
    private Long platformFee;
    private Long commissionFee;
    private Long netRevenue;
    private Long approvedNetAmount;
    private LocalDateTime eventEndTimeSnapshot;
    private LocalDateTime holdUntil;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String note;
    private String rejectionReason;
    private Long approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;
    private String transactionRef;
    private Long proofFileId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
