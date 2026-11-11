package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.mapper.PaginationMapper;
import com.trungpd.eventticketplatform.common.storage.service.IFileUploadService;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.events.entity.FeePolicy;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.mapper.*;
import com.trungpd.eventticketplatform.events.repository.EventPayoutInfoRepository;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.events.repository.EventSettingRepository;
import com.trungpd.eventticketplatform.events.repository.PromotionRepository;
import com.trungpd.eventticketplatform.events.service.ICategoryService;
import com.trungpd.eventticketplatform.events.service.IFeePolicyService;
import com.trungpd.eventticketplatform.events.service.IProvinceService;
import com.trungpd.eventticketplatform.events.service.IWardService;
import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import com.trungpd.eventticketplatform.ticketing.mapper.TicketTypeMapper;
import com.trungpd.eventticketplatform.ticketing.repository.TicketTypeRepository;
import com.trungpd.eventticketplatform.ticketing.service.ITicketService;
import com.trungpd.eventticketplatform.ticketing.service.TicketQrService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test cho các hành vi QR / vòng đờ i sự kiện trong EventService.
 *
 * - publishEvent phải sinh secret key khi duyệt lần đầu.
 * - publishEvent không được sinh lại key nếu đã có.
 * - finishEvents chuyển ONGOING -> CLOSED khi event đã hết giờ.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EventServiceQrTest {

    @Mock private EventRepository eventRepository;
    @Mock private EventMapper eventMapper;
    @Mock private EventSettingRepository eventSettingRepository;
    @Mock private EventSettingMapper eventSettingMapper;
    @Mock private EventPayoutInfoRepository eventPayoutInfoRepository;
    @Mock private EventPayoutInfoMapper eventPayoutInfoMapper;
    @Mock private IFeePolicyService feePolicyService;
    @Mock private ICategoryService categoryService;
    @Mock private IProvinceService provinceService;
    @Mock private IWardService wardService;
    @Mock private CategoryMapper categoryMapper;
    @Mock private LocationMapper locationMapper;
    @Mock private TicketTypeRepository ticketTypeRepository;
    @Mock private TicketTypeMapper ticketTypeMapper;
    @Mock private PromotionRepository promotionRepository;
    @Mock private PromotionMapper promotionMapper;
    @Mock private IUserService userService;
    @Mock private ITicketService ticketService;
    @Mock private PaginationMapper paginationMapper;
    @Mock private IFileUploadService fileUploadService;
    @Mock private TicketQrService ticketQrService;

    @InjectMocks
    private EventService eventService;

    private Event pendingReviewEvent;
    private FeePolicy feePolicy;

    @BeforeEach
    void setUp() {
        pendingReviewEvent = new Event();
        pendingReviewEvent.setId(1L);
        pendingReviewEvent.setStatus(EventStatus.PENDING_REVIEW);
        pendingReviewEvent.setFeePolicyId(10L);

        feePolicy = new FeePolicy();
        feePolicy.setId(10L);
        feePolicy.setOrganizerCommissionRate(BigDecimal.valueOf(0.1));
        feePolicy.setCustomerFeeRate(BigDecimal.valueOf(0.05));
        feePolicy.setCustomerFlatFee(5000L);
    }

    private void stubPublishDependencies() {
        when(ticketTypeRepository.existsByEventIdAndTotalQuantityGreaterThan(1L, 0)).thenReturn(true);
        when(feePolicyService.findActiveById(10L)).thenReturn(feePolicy);
        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> inv.getArgument(0));
        when(eventMapper.toResponse(any(Event.class))).thenReturn(EventResponse.builder().id(1L).build());
        when(fileUploadService.findByReferenceIdAndType(any(), any(FileType.class))).thenReturn(Optional.empty());
        when(ticketTypeRepository.findByEventId(1L)).thenReturn(List.of());
        when(eventSettingRepository.findById(1L)).thenReturn(Optional.empty());
        when(eventPayoutInfoRepository.findByEventId(1L)).thenReturn(Optional.empty());
    }

    @Test
    void publishEvent_shouldGenerateSecretKey_whenKeyMissing() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(pendingReviewEvent));
        stubPublishDependencies();
        when(ticketQrService.generateSecretKey()).thenReturn("generated-secret");

        eventService.publishEvent(1L);

        assertEquals("generated-secret", pendingReviewEvent.getSecretKey());
        assertEquals(EventStatus.PUBLISHED, pendingReviewEvent.getStatus());
        verify(ticketQrService).generateSecretKey();
    }

    @Test
    void publishEvent_shouldKeepExistingSecretKey_whenKeyAlreadyExists() {
        pendingReviewEvent.setSecretKey("existing-secret");
        when(eventRepository.findById(1L)).thenReturn(Optional.of(pendingReviewEvent));
        stubPublishDependencies();

        eventService.publishEvent(1L);

        assertEquals("existing-secret", pendingReviewEvent.getSecretKey());
        verify(ticketQrService, never()).generateSecretKey();
    }

    @Test
    void finishEvents_shouldCloseOngoingEventsPassedEndTime() {
        Event ongoing1 = new Event();
        ongoing1.setId(2L);
        ongoing1.setStatus(EventStatus.ONGOING);
        ongoing1.setEndTime(LocalDateTime.now().minusMinutes(1));

        Event ongoing2 = new Event();
        ongoing2.setId(3L);
        ongoing2.setStatus(EventStatus.ONGOING);
        ongoing2.setEndTime(LocalDateTime.now().minusMinutes(10));

        when(eventRepository.findByStatusAndEndTimeLessThanEqual(eq(EventStatus.ONGOING), any()))
                .thenReturn(List.of(ongoing1, ongoing2));

        int closed = eventService.finishEvents();

        assertEquals(2, closed);
        assertEquals(EventStatus.CLOSED, ongoing1.getStatus());
        assertEquals(EventStatus.CLOSED, ongoing2.getStatus());
        verify(eventRepository).saveAll(List.of(ongoing1, ongoing2));
    }

    @Test
    void finishEvents_shouldReturnZero_whenNoFinishedEvents() {
        when(eventRepository.findByStatusAndEndTimeLessThanEqual(eq(EventStatus.ONGOING), any()))
                .thenReturn(List.of());

        int closed = eventService.finishEvents();

        assertEquals(0, closed);
        verify(eventRepository, never()).saveAll(any());
    }
}
