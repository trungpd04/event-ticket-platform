package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.common.mapper.PaginationMapper;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.common.storage.service.IFileUploadService;
import com.trungpd.eventticketplatform.events.dto.request.PublishedEventUpdateRequest;
import com.trungpd.eventticketplatform.events.dto.request.RejectEventUpdateRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventUpdateRequestResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.entity.EventUpdateRequest;
import com.trungpd.eventticketplatform.events.entity.EventUpdateRequestStatus;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.events.repository.EventUpdateRequestRepository;
import com.trungpd.eventticketplatform.events.service.ICategoryService;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventUpdateRequestService implements IEventUpdateRequestService {

    private final EventUpdateRequestRepository eventUpdateRequestRepository;
    private final EventRepository eventRepository;
    private final IUserService userService;
    private final IEventService eventService;
    private final PaginationMapper paginationMapper;
    private final ICategoryService categoryService;
    private final IFileUploadService fileUploadService;

    @Override
    @Transactional
    public EventUpdateRequestResponse createEventUpdateRequest(Long userId, Long eventId, PublishedEventUpdateRequest request) {
        User user = userService.findById(userId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        if (!event.getOrganizerId().equals(user.getId())) {
            throw new BusinessException("error.event.not-owner");
        }

        if (event.getStatus() != EventStatus.PUBLISHED && event.getStatus() != EventStatus.ONGOING) {
            throw new BusinessException("error.event-update-request.invalid-status");
        }

        EventUpdateRequest updateRequest = new EventUpdateRequest();
        updateRequest.setEventId(eventId);
        updateRequest.setOrganizerId(user.getId());
        updateRequest.setStatus(EventUpdateRequestStatus.PENDING_REVIEW);
        updateRequest.setPayload(request);

        EventUpdateRequest saved = eventUpdateRequestRepository.save(updateRequest);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EventUpdateRequestResponse> getEventUpdateRequests(EventUpdateRequestStatus status, Pageable pageable) {
        Page<EventUpdateRequest> page;
        if (status == null) {
            page = eventUpdateRequestRepository.findAll(pageable);
        } else {
            page = eventUpdateRequestRepository.findByStatus(status, pageable);
        }
        return paginationMapper.toPagedResponse(page.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public EventUpdateRequestResponse getEventUpdateRequestDetail(Long id) {
        EventUpdateRequest request = eventUpdateRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.event-update-request.not-found"));
        return toResponse(request);
    }

    @Override
    @Transactional
    public EventUpdateRequestResponse approveEventUpdateRequest(Long adminUserId, Long id) {
        EventUpdateRequest request = eventUpdateRequestRepository.findByIdAndStatus(id, EventUpdateRequestStatus.PENDING_REVIEW)
                .orElseThrow(() -> new NotFoundException("error.event-update-request.not-found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        if (event.getStatus() != EventStatus.PUBLISHED && event.getStatus() != EventStatus.ONGOING) {
            throw new BusinessException("error.event-update-request.invalid-event-status");
        }

        eventService.applyPublishedEventUpdate(adminUserId, event, request.getPayload());

        request.setStatus(EventUpdateRequestStatus.APPROVED);
        request.setReviewedBy(adminUserId);
        request.setReviewedAt(LocalDateTime.now());
        EventUpdateRequest saved = eventUpdateRequestRepository.save(request);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public EventUpdateRequestResponse rejectEventUpdateRequest(Long adminUserId, Long id, RejectEventUpdateRequest request) {
        EventUpdateRequest updateRequest = eventUpdateRequestRepository.findByIdAndStatus(id, EventUpdateRequestStatus.PENDING_REVIEW)
                .orElseThrow(() -> new NotFoundException("error.event-update-request.not-found"));

        updateRequest.setStatus(EventUpdateRequestStatus.REJECTED);
        updateRequest.setReviewedBy(adminUserId);
        updateRequest.setReviewedAt(LocalDateTime.now());
        updateRequest.setRejectionReason(request.getRejectionReason());
        EventUpdateRequest saved = eventUpdateRequestRepository.save(updateRequest);

        return toResponse(saved);
    }

    private EventUpdateRequestResponse toResponse(EventUpdateRequest request) {
        Event event = null;
        User organizer = null;
        try {
            event = eventRepository.findById(request.getEventId()).orElse(null);
        } catch (Exception e) {
            log.warn("Could not load event for update request {}", request.getId());
        }
        try {
            organizer = userService.findById(request.getOrganizerId());
        } catch (Exception e) {
            log.warn("Could not load organizer for update request {}", request.getId());
        }

        PublishedEventUpdateRequest payload = request.getPayload();
        String categoryName = null;
        if (payload != null && payload.getCategoryId() != null) {
            try {
                categoryName = categoryService.findById(payload.getCategoryId()).getName();
            } catch (Exception e) {
                log.warn("Could not load category {} for update request {}", payload.getCategoryId(), request.getId());
            }
        }
        String thumbnailUrl = resolveFileUrl(payload != null ? payload.getThumbnailFileId() : null);
        String bannerUrl = resolveFileUrl(payload != null ? payload.getBannerFileId() : null);

        return EventUpdateRequestResponse.builder()
                .id(request.getId())
                .eventId(request.getEventId())
                .eventTitle(event != null ? event.getTitle() : null)
                .organizerId(request.getOrganizerId())
                .organizerEmail(organizer != null ? organizer.getEmail() : null)
                .categoryName(categoryName)
                .thumbnailUrl(thumbnailUrl)
                .bannerUrl(bannerUrl)
                .payload(payload)
                .status(request.getStatus())
                .rejectionReason(request.getRejectionReason())
                .reviewedBy(request.getReviewedBy())
                .reviewedAt(request.getReviewedAt())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }

    private String resolveFileUrl(Long fileId) {
        if (fileId == null) {
            return null;
        }
        try {
            return fileUploadService.getFileUrl(fileId);
        } catch (Exception e) {
            log.warn("Could not resolve file url for {}", fileId);
            return null;
        }
    }

}
