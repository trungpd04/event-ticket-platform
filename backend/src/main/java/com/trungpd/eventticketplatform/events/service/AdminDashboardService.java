package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.response.AdminDashboardStatsResponse;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.repository.CategoryRepository;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.events.repository.FeePolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final FeePolicyRepository feePolicyRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getStats() {
        long pendingEventsCount = eventRepository.countByStatus(EventStatus.PENDING);
        long totalCategories = categoryRepository.count();
        long totalFeePolicies = feePolicyRepository.count();

        return AdminDashboardStatsResponse.builder()
                .pendingEventsCount(pendingEventsCount)
                .totalCategories(totalCategories)
                .totalFeePolicies(totalFeePolicies)
                .build();
    }

}
