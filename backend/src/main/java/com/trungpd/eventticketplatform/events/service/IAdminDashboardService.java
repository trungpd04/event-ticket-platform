package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.response.AdminDashboardStatsResponse;

public interface IAdminDashboardService {

    AdminDashboardStatsResponse getStats();
}
