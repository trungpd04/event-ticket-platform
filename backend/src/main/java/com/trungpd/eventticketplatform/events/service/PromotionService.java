package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.dto.request.PromotionRequest;
import com.trungpd.eventticketplatform.events.dto.request.ValidatePromotionRequest;
import com.trungpd.eventticketplatform.events.dto.response.PromotionResponse;
import com.trungpd.eventticketplatform.events.dto.response.PromotionValidationResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.entity.Promotion;
import com.trungpd.eventticketplatform.events.mapper.PromotionMapper;
import com.trungpd.eventticketplatform.events.repository.PromotionRepository;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final EventService eventService;
    private final PromotionMapper promotionMapper;
    private final UserService userService;

    @Transactional
    public PromotionResponse createPromotion(String email, Long eventId, PromotionRequest request) {
        User user = userService.findByEmail(email);
        Event event = eventService.findEventById(eventId);

        validateEventOwnership(event, user.getId());
        validatePromotionPeriod(request);

        if (promotionRepository.existsByEventIdAndCodeIgnoreCase(eventId, request.getCode())) {
            throw new BusinessException("error.promotion.code-exists");
        }

        Promotion promotion = promotionMapper.toEntity(request);
        promotion.setEventId(eventId);
        promotion.setUsedCount(0);

        Promotion saved = promotionRepository.save(promotion);
        return promotionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> getPromotionsByEvent(Long eventId) {
        return promotionRepository.findByEventId(eventId).stream()
                .map(promotionMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PromotionValidationResponse validatePromotion(ValidatePromotionRequest request) {
        Event event = eventService.findEventById(request.getEventId());

        if (event.getStatus() != EventStatus.PUBLISHED) {
            return buildInvalidResponse(request.getCode());
        }

        Promotion promotion = promotionRepository
                .findByEventIdAndCodeIgnoreCase(request.getEventId(), request.getCode())
                .orElse(null);

        if (promotion == null) {
            return buildInvalidResponse(request.getCode());
        }

        Instant now = Instant.now();
        boolean isValid = !now.isBefore(promotion.getValidFrom())
                && !now.isAfter(promotion.getValidUntil())
                && promotion.getUsedCount() < promotion.getUsageLimit();

        return PromotionValidationResponse.builder()
                .code(promotion.getCode())
                .discountPercent(promotion.getDiscountPercent())
                .maxDiscount(promotion.getMaxDiscount())
                .isValid(isValid)
                .build();
    }

    private void validateEventOwnership(Event event, Long userId) {
        if (!event.getOrganizerId().equals(userId)) {
            throw new BusinessException("error.event.not-owner");
        }
    }

    private void validatePromotionPeriod(PromotionRequest request) {
        if (!request.getValidUntil().isAfter(request.getValidFrom())) {
            throw new BusinessException("error.promotion.invalid-period");
        }
    }

    private PromotionValidationResponse buildInvalidResponse(String code) {
        return PromotionValidationResponse.builder()
                .code(code)
                .isValid(false)
                .build();
    }

}
