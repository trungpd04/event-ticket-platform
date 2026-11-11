package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.dto.request.AssignCheckerRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventCheckerResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventChecker;
import com.trungpd.eventticketplatform.events.mapper.EventMapper;
import com.trungpd.eventticketplatform.events.repository.EventCheckerRepository;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventCheckerService implements IEventCheckerService {

    private final EventCheckerRepository eventCheckerRepository;
    private final EventRepository eventRepository;
    private final IUserService userService;
    private final EventMapper eventMapper;
    private final IEventService eventService;

    @Override
    @Transactional
    public EventCheckerResponse assignChecker(Long eventId, AssignCheckerRequest request) {
        if (!eventRepository.existsById(eventId)) {
            throw new NotFoundException("error.event.not-found");
        }

        User checker = userService.findById(request.getCheckerId());
        if (checker.getRoles() == null || !checker.getRoles().contains(Role.CHECKER)) {
            throw new BusinessException("error.checker.user-not-checker");
        }

        if (eventCheckerRepository.existsByEventIdAndCheckerId(eventId, checker.getId())) {
            throw new BusinessException("error.checker.already-assigned");
        }

        EventChecker eventChecker = new EventChecker();
        eventChecker.setEventId(eventId);
        eventChecker.setCheckerId(checker.getId());

        EventChecker saved = eventCheckerRepository.save(eventChecker);
        return toResponse(saved, checker);
    }

    @Override
    @Transactional
    public void removeChecker(Long eventId, Long checkerId) {
        EventChecker eventChecker = eventCheckerRepository.findByEventIdAndCheckerId(eventId, checkerId)
                .orElseThrow(() -> new BusinessException("error.checker.not-assigned"));
        eventCheckerRepository.delete(eventChecker);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventCheckerResponse> findCheckersByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new NotFoundException("error.event.not-found");
        }
        List<EventChecker> checkers = eventCheckerRepository.findByEventId(eventId);
        return checkers.stream()
                .map(ec -> {
                    User user = userService.findById(ec.getCheckerId());
                    return toResponse(ec, user);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> findAssignedEvents(Long checkerId) {
        List<Long> eventIds = eventCheckerRepository.findByCheckerId(checkerId).stream()
                .map(EventChecker::getEventId)
                .distinct()
                .toList();

        return eventRepository.findAllById(eventIds).stream()
                .map(eventMapper::toResponse)
                .map(eventService::enrichEventResponse)
                .toList();
    }

    private EventCheckerResponse toResponse(EventChecker eventChecker, User checker) {
        return EventCheckerResponse.builder()
                .id(eventChecker.getId())
                .eventId(eventChecker.getEventId())
                .checkerId(eventChecker.getCheckerId())
                .checkerEmail(checker.getEmail())
                .checkerFullName(checker.getFullName())
                .createdAt(eventChecker.getCreatedAt())
                .build();
    }
}
