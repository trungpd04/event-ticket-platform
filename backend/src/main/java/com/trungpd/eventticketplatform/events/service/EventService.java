package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.common.mapper.PaginationMapper;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.dto.request.CreateEventRequest;
import com.trungpd.eventticketplatform.events.dto.request.UpdateEventRequest;
import com.trungpd.eventticketplatform.events.dto.response.CategoryResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventDetailResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.dto.response.ProvinceResponse;
import com.trungpd.eventticketplatform.events.dto.response.PromotionResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.entity.FeePolicy;
import com.trungpd.eventticketplatform.events.entity.Promotion;
import com.trungpd.eventticketplatform.events.enums.TimeFilter;
import com.trungpd.eventticketplatform.events.mapper.CategoryMapper;
import com.trungpd.eventticketplatform.events.mapper.EventMapper;
import com.trungpd.eventticketplatform.events.mapper.LocationMapper;
import com.trungpd.eventticketplatform.events.mapper.PromotionMapper;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.events.repository.PromotionRepository;
import com.trungpd.eventticketplatform.events.specification.EventSpecification;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.UserService;
import com.trungpd.eventticketplatform.ticketing.mapper.TicketTypeMapper;
import com.trungpd.eventticketplatform.ticketing.repository.TicketTypeRepository;
import com.trungpd.eventticketplatform.ticketing.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final FeePolicyService feePolicyService;
    private final CategoryService categoryService;
    private final ProvinceService provinceService;
    private final CategoryMapper categoryMapper;
    private final LocationMapper locationMapper;
    private final TicketTypeRepository ticketTypeRepository;
    private final TicketTypeMapper ticketTypeMapper;
    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;
    private final UserService userService;
    private final TicketService ticketService;
    private final PaginationMapper paginationMapper;

    @Transactional
    public EventResponse createEvent(String email, CreateEventRequest request) {
        User user = userService.findByEmail(email);

        validateEventTimes(request.getStartTime(), request.getEndTime());
        validateTicketSalePeriod(
                request.getTicketSaleStartTime(),
                request.getTicketSaleEndTime(),
                request.getStartTime()
        );

        FeePolicy feePolicy = feePolicyService.findActiveById(request.getFeePolicyId());
        categoryService.findActiveById(request.getCategoryId());
        provinceService.findById(request.getProvinceId());

        Event event = eventMapper.toEntity(request);
        event.setOrganizerId(user.getId());
        event.setFeePolicyId(feePolicy.getId());
        event.setStatus(EventStatus.PENDING);

        Event saved = eventRepository.save(event);
        return enrichEventResponse(eventMapper.toResponse(saved));
    }

    @Transactional(readOnly = true)
    public PagedResponse<EventResponse> searchEvents(String title, String location,
                                                      Instant fromDate, Instant toDate,
                                                      EventStatus status, TimeFilter timeFilter,
                                                      Long categoryId, Long provinceId,
                                                      Pageable pageable) {
        Specification<Event> spec = Specification.where(EventSpecification.hasStatus(status));

        if (title != null && !title.isBlank()) {
            spec = spec.and(EventSpecification.hasTitle(title));
        }
        if (location != null && !location.isBlank()) {
            spec = spec.and(EventSpecification.hasLocation(location));
        }
        if (fromDate != null) {
            spec = spec.and(EventSpecification.startTimeGreaterThanOrEqual(fromDate));
        }
        if (toDate != null) {
            spec = spec.and(EventSpecification.startTimeLessThanOrEqual(toDate));
        }
        if (timeFilter != null) {
            spec = spec.and(EventSpecification.hasTimeFilter(timeFilter));
        }
        if (categoryId != null) {
            spec = spec.and(EventSpecification.hasCategory(categoryId));
        }
        if (provinceId != null) {
            spec = spec.and(EventSpecification.hasProvince(provinceId));
        }

        Page<Event> page = eventRepository.findAll(spec, pageable);
        Page<EventResponse> responsePage = page.map(eventMapper::toResponse).map(this::enrichEventResponse);
        return paginationMapper.toPagedResponse(responsePage);
    }

    @Cacheable(value = "events", key = "#id")
    @Transactional(readOnly = true)
    public EventDetailResponse getEventDetail(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        EventDetailResponse response = eventMapper.toDetailResponse(event);
        response.setTicketTypes(ticketTypeRepository.findByEventId(id).stream()
                .map(ticketTypeMapper::toResponse)
                .toList());
        response.setActivePromotions(getActivePromotions(id));

        return enrichEventDetailResponse(response);
    }

    @CacheEvict(value = "events", key = "#id")
    @Transactional
    public EventResponse updateEvent(String email, Long id, UpdateEventRequest request) {
        User user = userService.findByEmail(email);
        Event event = findEventById(id);

        validateEventOwnership(event, user.getId());
        validateEventEditable(event);

        boolean timesChanged = request.getStartTime() != null || request.getEndTime() != null;
        boolean saleTimesChanged = request.getTicketSaleStartTime() != null || request.getTicketSaleEndTime() != null;

        Instant startTime = request.getStartTime() != null ? request.getStartTime() : event.getStartTime();
        Instant endTime = request.getEndTime() != null ? request.getEndTime() : event.getEndTime();
        Instant saleStart = request.getTicketSaleStartTime() != null ? request.getTicketSaleStartTime() : event.getTicketSaleStartTime();
        Instant saleEnd = request.getTicketSaleEndTime() != null ? request.getTicketSaleEndTime() : event.getTicketSaleEndTime();

        if (timesChanged) {
            validateEventTimes(startTime, endTime);
        }
        if (timesChanged || saleTimesChanged) {
            validateTicketSalePeriod(saleStart, saleEnd, startTime);
        }

        eventMapper.updateEntityFromRequest(request, event);

        if (request.getFeePolicyId() != null) {
            FeePolicy feePolicy = feePolicyService.findActiveById(request.getFeePolicyId());
            event.setFeePolicyId(feePolicy.getId());
        }
        if (request.getCategoryId() != null) {
            categoryService.findActiveById(request.getCategoryId());
        }
        if (request.getProvinceId() != null) {
            provinceService.findById(request.getProvinceId());
        }

        Event updated = eventRepository.save(event);
        return enrichEventResponse(eventMapper.toResponse(updated));
    }

    @Transactional(readOnly = true)
    public void requestPublish(String email, Long id) {
        User user = userService.findByEmail(email);
        Event event = findEventById(id);

        validateEventOwnership(event, user.getId());
        validateEventEditable(event);
        validateHasTicketTypes(id);
    }

    @CacheEvict(value = "events", key = "#id")
    @Transactional
    public EventResponse publishEvent(Long id) {
        Event event = findEventById(id);

        if (event.getStatus() != EventStatus.PENDING) {
            throw new BusinessException("error.event.invalid-status");
        }

        validateHasTicketTypes(id);
        ticketService.preAllocateTickets(id);

        FeePolicy feePolicy = feePolicyService.findActiveById(event.getFeePolicyId());
        event.setOrganizerCommissionRateSnapshot(feePolicy.getOrganizerCommissionRate());
        event.setCustomerFeeRateSnapshot(feePolicy.getCustomerFeeRate());
        event.setCustomerFlatFeeSnapshot(feePolicy.getCustomerFlatFee());

        event.setStatus(EventStatus.PUBLISHED);
        Event updated = eventRepository.save(event);
        return enrichEventResponse(eventMapper.toResponse(updated));
    }

    @CacheEvict(value = "events", key = "#id")
    @Transactional
    public EventResponse closeEvent(Long id) {
        Event event = findEventById(id);

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessException("error.event.invalid-status");
        }

        ticketService.closeTicketSales(id);

        event.setStatus(EventStatus.CLOSED);
        Event updated = eventRepository.save(event);
        return enrichEventResponse(eventMapper.toResponse(updated));
    }

    @Transactional(readOnly = true)
    public PagedResponse<EventResponse> getOrganizerEvents(String email, Pageable pageable) {
        User user = userService.findByEmail(email);
        Page<Event> page = eventRepository.findByOrganizerId(user.getId(), pageable);
        Page<EventResponse> responsePage = page.map(eventMapper::toResponse).map(this::enrichEventResponse);
        return paginationMapper.toPagedResponse(responsePage);
    }

    @Transactional(readOnly = true)
    public Event findEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));
    }

    private void validateEventTimes(Instant startTime, Instant endTime) {
        Instant oneHourFromNow = Instant.now().plus(1, ChronoUnit.HOURS);
        if (!startTime.isAfter(oneHourFromNow)) {
            throw new BusinessException("error.event.start-time-too-soon");
        }
        if (!endTime.isAfter(startTime)) {
            throw new BusinessException("error.validation.end-time-after-start");
        }
    }

    private void validateTicketSalePeriod(Instant saleStart, Instant saleEnd, Instant eventStart) {
        if (!saleEnd.isAfter(saleStart)) {
            throw new BusinessException("error.event.invalid-sale-period");
        }
        if (saleEnd.isAfter(eventStart)) {
            throw new BusinessException("error.event.sale-after-start");
        }
    }

    private void validateEventOwnership(Event event, Long userId) {
        if (!event.getOrganizerId().equals(userId)) {
            throw new BusinessException("error.event.not-owner");
        }
    }

    private void validateEventEditable(Event event) {
        if (event.getStatus() != EventStatus.PENDING) {
            throw new BusinessException("error.event.not-editable");
        }
    }

    private void validateHasTicketTypes(Long eventId) {
        boolean hasTickets = ticketTypeRepository.existsByEventIdAndTotalQuantityGreaterThan(eventId, 0);
        if (!hasTickets) {
            throw new BusinessException("error.event.no-ticket-types");
        }
    }

    private List<PromotionResponse> getActivePromotions(Long eventId) {
        List<Promotion> promotions = promotionRepository.findActiveByEventId(eventId, Instant.now());
        return promotions.stream()
                .map(promotionMapper::toResponse)
                .toList();
    }

    private EventResponse enrichEventResponse(EventResponse response) {
        if (response == null) {
            return null;
        }
        if (response.getCategory() != null && response.getCategory().getId() != null) {
            CategoryResponse category = categoryMapper.toResponse(categoryService.findById(response.getCategory().getId()));
            response.setCategory(category);
        }
        if (response.getProvince() != null && response.getProvince().getId() != null) {
            ProvinceResponse province = locationMapper.toProvinceResponse(provinceService.findById(response.getProvince().getId()));
            response.setProvince(province);
        }
        return response;
    }

    private EventDetailResponse enrichEventDetailResponse(EventDetailResponse response) {
        if (response == null) {
            return null;
        }
        if (response.getCategory() != null && response.getCategory().getId() != null) {
            CategoryResponse category = categoryMapper.toResponse(categoryService.findById(response.getCategory().getId()));
            response.setCategory(category);
        }
        if (response.getProvince() != null && response.getProvince().getId() != null) {
            ProvinceResponse province = locationMapper.toProvinceResponse(provinceService.findById(response.getProvince().getId()));
            response.setProvince(province);
        }
        return response;
    }

}
