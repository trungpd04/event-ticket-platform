package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.events.dto.request.AssignCheckerRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventCheckerResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventChecker;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.mapper.EventMapper;
import com.trungpd.eventticketplatform.events.repository.EventCheckerRepository;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho EventCheckerService.
 *
 * Admin assign/gỡ nhân viên soát vé (CHECKER) cho từng sự kiện.
 * Checker chỉ được assign nếu user có role CHECKER.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EventCheckerServiceTest {

    @Mock private EventCheckerRepository eventCheckerRepository;
    @Mock private EventRepository eventRepository;
    @Mock private IUserService userService;
    @Mock private EventMapper eventMapper;
    @Mock private IEventService eventService;

    @InjectMocks
    private EventCheckerService eventCheckerService;

    private static final Long EVENT_ID = 1L;
    private static final Long CHECKER_ID = 10L;

    private User checkerUser;
    private User nonCheckerUser;

    @BeforeEach
    void setUp() {
        checkerUser = new User();
        checkerUser.setId(CHECKER_ID);
        checkerUser.setEmail("checker@example.com");
        checkerUser.setFullName("Checker A");
        checkerUser.setRoles(Set.of(Role.CHECKER));

        nonCheckerUser = new User();
        nonCheckerUser.setId(20L);
        nonCheckerUser.setEmail("customer@example.com");
        nonCheckerUser.setRoles(Set.of(Role.CUSTOMER));
    }

    @Test
    void assignChecker_shouldSucceed_whenUserIsChecker() {
        AssignCheckerRequest request = new AssignCheckerRequest();
        request.setCheckerId(CHECKER_ID);

        when(eventRepository.existsById(EVENT_ID)).thenReturn(true);
        when(userService.findById(CHECKER_ID)).thenReturn(checkerUser);
        when(eventCheckerRepository.existsByEventIdAndCheckerId(EVENT_ID, CHECKER_ID)).thenReturn(false);
        when(eventCheckerRepository.save(any(EventChecker.class))).thenAnswer(inv -> {
            EventChecker ec = inv.getArgument(0);
            ec.setId(100L);
            ec.setCreatedAt(LocalDateTime.now());
            return ec;
        });

        EventCheckerResponse response = eventCheckerService.assignChecker(EVENT_ID, request);

        assertNotNull(response);
        assertEquals(EVENT_ID, response.getEventId());
        assertEquals(CHECKER_ID, response.getCheckerId());
        assertEquals("checker@example.com", response.getCheckerEmail());
    }

    @Test
    void assignChecker_shouldThrow_whenUserIsNotChecker() {
        AssignCheckerRequest request = new AssignCheckerRequest();
        request.setCheckerId(nonCheckerUser.getId());

        when(eventRepository.existsById(EVENT_ID)).thenReturn(true);
        when(userService.findById(nonCheckerUser.getId())).thenReturn(nonCheckerUser);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> eventCheckerService.assignChecker(EVENT_ID, request));

        assertEquals("error.checker.user-not-checker", ex.getMessageKey());
        verify(eventCheckerRepository, never()).save(any());
    }

    @Test
    void assignChecker_shouldThrow_whenAlreadyAssigned() {
        AssignCheckerRequest request = new AssignCheckerRequest();
        request.setCheckerId(CHECKER_ID);

        when(eventRepository.existsById(EVENT_ID)).thenReturn(true);
        when(userService.findById(CHECKER_ID)).thenReturn(checkerUser);
        when(eventCheckerRepository.existsByEventIdAndCheckerId(EVENT_ID, CHECKER_ID)).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> eventCheckerService.assignChecker(EVENT_ID, request));

        assertEquals("error.checker.already-assigned", ex.getMessageKey());
    }

    @Test
    void removeChecker_shouldSucceed_whenAssigned() {
        EventChecker eventChecker = new EventChecker();
        eventChecker.setId(100L);
        eventChecker.setEventId(EVENT_ID);
        eventChecker.setCheckerId(CHECKER_ID);

        when(eventCheckerRepository.findByEventIdAndCheckerId(EVENT_ID, CHECKER_ID))
                .thenReturn(Optional.of(eventChecker));

        eventCheckerService.removeChecker(EVENT_ID, CHECKER_ID);

        verify(eventCheckerRepository).delete(eventChecker);
    }

    @Test
    void removeChecker_shouldThrow_whenNotAssigned() {
        when(eventCheckerRepository.findByEventIdAndCheckerId(EVENT_ID, CHECKER_ID))
                .thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class,
                () -> eventCheckerService.removeChecker(EVENT_ID, CHECKER_ID));

        assertEquals("error.checker.not-assigned", ex.getMessageKey());
    }

    @Test
    void findCheckersByEvent_shouldReturnAssignedCheckers() {
        EventChecker ec = new EventChecker();
        ec.setId(100L);
        ec.setEventId(EVENT_ID);
        ec.setCheckerId(CHECKER_ID);
        ec.setCreatedAt(LocalDateTime.now());

        when(eventRepository.existsById(EVENT_ID)).thenReturn(true);
        when(eventCheckerRepository.findByEventId(EVENT_ID)).thenReturn(List.of(ec));
        when(userService.findById(CHECKER_ID)).thenReturn(checkerUser);

        List<EventCheckerResponse> result = eventCheckerService.findCheckersByEvent(EVENT_ID);

        assertEquals(1, result.size());
        assertEquals(CHECKER_ID, result.get(0).getCheckerId());
    }

    @Test
    void findAssignedEvents_shouldReturnEnrichedEventsForChecker() {
        Event event = new Event();
        event.setId(EVENT_ID);
        event.setStatus(EventStatus.ONGOING);

        EventChecker ec = new EventChecker();
        ec.setEventId(EVENT_ID);
        ec.setCheckerId(CHECKER_ID);

        EventResponse response = EventResponse.builder().id(EVENT_ID).build();

        when(eventCheckerRepository.findByCheckerId(CHECKER_ID)).thenReturn(List.of(ec));
        when(eventRepository.findAllById(List.of(EVENT_ID))).thenReturn(List.of(event));
        when(eventMapper.toResponse(event)).thenReturn(response);
        when(eventService.enrichEventResponse(response)).thenReturn(response);

        List<EventResponse> result = eventCheckerService.findAssignedEvents(CHECKER_ID);

        assertEquals(1, result.size());
        assertEquals(EVENT_ID, result.get(0).getId());
    }
}
