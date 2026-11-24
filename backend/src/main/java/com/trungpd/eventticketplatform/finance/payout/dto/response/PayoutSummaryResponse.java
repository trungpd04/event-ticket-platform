package com.trungpd.eventticketplatform.finance.payout.dto.response;

import com.trungpd.eventticketplatform.events.entity.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PayoutSummaryResponse {
    private Long eventId;
    private String eventTitle;
    private EventStatus eventStatus;
    private boolean canRequest;
    private String reason;
    private LocalDateTime holdUntil;
    private Integer orderCount;
    private Long grossTicketAmount;
    private Long discountAmount;
    private Long grossRevenue;
    private Long platformFee;
    private Long commissionFee;
    private Long netRevenue;
    private PayoutResponse existingPayout;
}
