package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.request.PromotionRequest;
import com.trungpd.eventticketplatform.events.dto.request.ValidatePromotionRequest;
import com.trungpd.eventticketplatform.events.dto.response.PromotionResponse;
import com.trungpd.eventticketplatform.events.dto.response.PromotionValidationResponse;

import java.util.List;

public interface IPromotionService {

    PromotionResponse createPromotion(Long userId, Long eventId, PromotionRequest request);

    List<PromotionResponse> getPromotionsByEvent(Long eventId);

    PromotionValidationResponse validatePromotion(ValidatePromotionRequest request);
}
