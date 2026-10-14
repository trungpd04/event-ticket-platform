package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStatsResponse {

    private Long pendingEventsCount;
    private Long totalCategories;
    private Long totalFeePolicies;

}
