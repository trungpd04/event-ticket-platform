package com.trungpd.eventticketplatform.finance.payout.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.common.mapper.PaginationMapper;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.EventPayoutInfo;
import com.trungpd.eventticketplatform.events.repository.EventPayoutInfoRepository;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.finance.payout.PayoutStatus;
import com.trungpd.eventticketplatform.finance.payout.dto.request.ApprovePayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.request.CreatePayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.request.MarkPaidRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.request.RejectPayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.response.PayoutResponse;
import com.trungpd.eventticketplatform.finance.payout.dto.response.PayoutSummaryResponse;
import com.trungpd.eventticketplatform.finance.payout.entity.PayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.repository.PayoutRequestRepository;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.IEmailService;
import com.trungpd.eventticketplatform.identity.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayoutService implements IPayoutService {

    private final EventRepository eventRepository;
    private final EventPayoutInfoRepository eventPayoutInfoRepository;
    private final PayoutRequestRepository payoutRequestRepository;
    private final PayoutRevenueCalculator revenueCalculator;
    private final PayoutEligibilityService eligibilityService;
    private final PayoutRequestCodeGenerator codeGenerator;
    private final IUserService userService;
    private final IEmailService emailService;
    private final PaginationMapper paginationMapper;

    @Value("${app.payout.hold-days:7}")
    private int holdDays;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Transactional(readOnly = true)
    public PayoutSummaryResponse getSummary(Long organizerId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        if (!event.getOrganizerId().equals(organizerId)) {
            throw new BusinessException("error.event.not-owner");
        }

        PayoutRevenue revenue = revenueCalculator.calculate(eventId);
        PayoutEligibilityResult eligibility = eligibilityService.check(event, revenue);

        PayoutResponse existing = payoutRequestRepository.findByEventIdAndStatusIn(
                        eventId, List.of(PayoutStatus.PENDING, PayoutStatus.APPROVED))
                .stream().findFirst()
                .map(this::toResponse)
                .orElse(null);

        return PayoutSummaryResponse.builder()
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .eventStatus(event.getStatus())
                .canRequest(eligibility.allowed())
                .reason(eligibility.reasonCode())
                .holdUntil(event.getEndTime().plusDays(holdDays))
                .orderCount(revenue.orderCount())
                .grossTicketAmount(revenue.grossTicketAmount())
                .discountAmount(revenue.discountAmount())
                .grossRevenue(revenue.grossRevenue())
                .platformFee(revenue.platformFee())
                .commissionFee(revenue.commissionFee())
                .netRevenue(revenue.netRevenue())
                .existingPayout(existing)
                .build();
    }

    @Override
    @Transactional
    public PayoutResponse create(Long organizerId, CreatePayoutRequest request) {
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            PayoutRequest existing = payoutRequestRepository.findByIdempotencyKey(request.getIdempotencyKey()).orElse(null);
            if (existing != null) {
                if (!existing.getOrganizerId().equals(organizerId)
                        || !existing.getEventId().equals(request.getEventId())) {
                    throw new BusinessException("error.payout.idempotency-conflict");
                }
                return toResponse(existing);
            }
        }

        Event event = eventRepository.findByIdForUpdate(request.getEventId())
                .orElseThrow(() -> new NotFoundException("error.event.not-found"));

        if (!event.getOrganizerId().equals(organizerId)) {
            throw new BusinessException("error.event.not-owner");
        }

        PayoutRevenue revenue = revenueCalculator.calculate(event.getId());
        PayoutEligibilityResult eligibility = eligibilityService.check(event, revenue);
        if (!eligibility.allowed()) {
            throw new BusinessException(eligibility.reasonCode());
        }

        EventPayoutInfo bank = eventPayoutInfoRepository.findByEventId(event.getId())
                .orElseThrow(() -> new BusinessException("error.payout.bank-info-required"));

        PayoutRequest payout = new PayoutRequest();
        payout.setRequestCode(codeGenerator.next());
        payout.setOrganizerId(organizerId);
        payout.setEventId(event.getId());
        payout.setOrderCount(revenue.orderCount());
        payout.setGrossTicketAmount(revenue.grossTicketAmount());
        payout.setDiscountAmount(revenue.discountAmount());
        payout.setGrossRevenue(revenue.grossRevenue());
        payout.setPlatformFee(revenue.platformFee());
        payout.setCommissionFee(revenue.commissionFee());
        payout.setNetRevenue(revenue.netRevenue());
        payout.setApprovedNetAmount(revenue.netRevenue());
        payout.setEventEndTimeSnapshot(event.getEndTime());
        payout.setHoldUntil(event.getEndTime().plusDays(holdDays));
        payout.setBankName(bank.getBankName());
        payout.setAccountNumber(bank.getAccountNumber());
        payout.setAccountHolder(bank.getAccountHolder());
        payout.setStatus(PayoutStatus.PENDING);
        payout.setNote(request.getNote());
        payout.setIdempotencyKey(request.getIdempotencyKey());

        try {
            PayoutRequest saved = payoutRequestRepository.save(payout);
            notifyOrganizer(organizerId, "Yêu cầu chi trả đã gửi",
                    "Yêu cầu " + saved.getRequestCode() + " đã được gửi, đang chờ duyệt.");
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("error.payout.already-exists");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PayoutResponse> listByOrganizer(Long organizerId, PayoutStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PayoutRequest> result = status == null
                ? payoutRequestRepository.findByOrganizerId(organizerId, pageable)
                : payoutRequestRepository.findByOrganizerIdAndStatus(organizerId, status, pageable);
        return paginationMapper.toPagedResponse(result.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PayoutResponse getByOrganizer(Long organizerId, Long id) {
        PayoutRequest payout = findOwned(id, organizerId);
        return toResponse(payout);
    }

    @Override
    @Transactional
    public PayoutResponse cancelByOrganizer(Long organizerId, Long id) {
        PayoutRequest payout = payoutRequestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("error.payout.not-found"));
        if (!payout.getOrganizerId().equals(organizerId)) {
            throw new BusinessException("error.payout.not-owner");
        }
        if (payout.getStatus() != PayoutStatus.PENDING) {
            throw new BusinessException("error.payout.cannot-cancel");
        }
        payout.setStatus(PayoutStatus.CANCELLED);
        PayoutRequest saved = payoutRequestRepository.save(payout);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PayoutResponse> listAll(PayoutStatus status, Long organizerId, Long eventId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PayoutRequest> result = payoutRequestRepository.search(status, organizerId, eventId, pageable);
        return paginationMapper.toPagedResponse(result.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PayoutResponse get(Long id) {
        PayoutRequest payout = payoutRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.payout.not-found"));
        return toResponse(payout);
    }

    @Override
    @Transactional
    public PayoutResponse approve(Long adminId, Long id, ApprovePayoutRequest request) {
        PayoutRequest payout = payoutRequestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("error.payout.not-found"));

        if (payout.getStatus() != PayoutStatus.PENDING) {
            throw new BusinessException("error.payout.invalid-status");
        }

        long approvedAmount = request.getApprovedNetAmount() != null
                ? request.getApprovedNetAmount()
                : payout.getNetRevenue();

        if (approvedAmount < 0) {
            throw new BusinessException("error.validation.amount-positive");
        }

        if (approvedAmount != payout.getNetRevenue() && (request.getNote() == null || request.getNote().isBlank())) {
            throw new BusinessException("error.payout.approval-note-required");
        }

        payout.setApprovedNetAmount(approvedAmount);
        payout.setStatus(PayoutStatus.APPROVED);
        payout.setApprovedBy(adminId);
        payout.setApprovedAt(LocalDateTime.now());
        payout.setNote(request.getNote());

        PayoutRequest saved = payoutRequestRepository.save(payout);
        notifyOrganizer(saved.getOrganizerId(), "Yêu cầu chi trả đã được duyệt",
                "Yêu cầu " + saved.getRequestCode() + " đã được duyệt. Số tiền dự kiến: "
                        + formatCurrency(saved.getApprovedNetAmount()) + " VND.");
        return toResponse(saved);
    }

    @Override
    @Transactional
    public PayoutResponse reject(Long adminId, Long id, RejectPayoutRequest request) {
        PayoutRequest payout = payoutRequestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("error.payout.not-found"));

        if (payout.getStatus() != PayoutStatus.PENDING) {
            throw new BusinessException("error.payout.invalid-status");
        }

        payout.setStatus(PayoutStatus.REJECTED);
        payout.setRejectionReason(request.getReason());
        payout.setApprovedBy(adminId);
        payout.setApprovedAt(LocalDateTime.now());

        PayoutRequest saved = payoutRequestRepository.save(payout);
        notifyOrganizer(saved.getOrganizerId(), "Yêu cầu chi trả bị từ chối",
                "Yêu cầu " + saved.getRequestCode() + " bị từ chối. Lý do: " + saved.getRejectionReason());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public PayoutResponse markPaid(Long adminId, Long id, MarkPaidRequest request) {
        PayoutRequest payout = payoutRequestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("error.payout.not-found"));

        if (payout.getStatus() != PayoutStatus.APPROVED) {
            throw new BusinessException("error.payout.invalid-status");
        }

        payout.setStatus(PayoutStatus.PAID);
        payout.setTransactionRef(request.getTransactionRef());
        payout.setPaidAt(request.getPaidAt());
        payout.setProofFileId(request.getProofFileId());
        payout.setApprovedBy(adminId);

        try {
            PayoutRequest saved = payoutRequestRepository.save(payout);
            notifyOrganizer(saved.getOrganizerId(), "Đã chuyển khoản doanh thu",
                    "Yêu cầu " + saved.getRequestCode() + " đã được thanh toán. Mã giao dịch: "
                            + saved.getTransactionRef() + ". Số tiền: "
                            + formatCurrency(saved.getApprovedNetAmount()) + " VND.");
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("error.payout.duplicate-transaction-ref");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long countPending() {
        return payoutRequestRepository.countByStatus(PayoutStatus.PENDING);
    }

    private PayoutRequest findOwned(Long id, Long organizerId) {
        PayoutRequest payout = payoutRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.payout.not-found"));
        if (!payout.getOrganizerId().equals(organizerId)) {
            throw new BusinessException("error.payout.not-owner");
        }
        return payout;
    }

    private PayoutResponse toResponse(PayoutRequest payout) {
        String eventTitle = eventRepository.findById(payout.getEventId())
                .map(Event::getTitle)
                .orElse(null);

        return PayoutResponse.builder()
                .id(payout.getId())
                .requestCode(payout.getRequestCode())
                .eventId(payout.getEventId())
                .eventTitle(eventTitle)
                .status(payout.getStatus())
                .orderCount(payout.getOrderCount())
                .grossTicketAmount(payout.getGrossTicketAmount())
                .discountAmount(payout.getDiscountAmount())
                .grossRevenue(payout.getGrossRevenue())
                .platformFee(payout.getPlatformFee())
                .commissionFee(payout.getCommissionFee())
                .netRevenue(payout.getNetRevenue())
                .approvedNetAmount(payout.getApprovedNetAmount())
                .eventEndTimeSnapshot(payout.getEventEndTimeSnapshot())
                .holdUntil(payout.getHoldUntil())
                .bankName(payout.getBankName())
                .accountNumber(payout.getAccountNumber())
                .accountHolder(payout.getAccountHolder())
                .note(payout.getNote())
                .rejectionReason(payout.getRejectionReason())
                .approvedBy(payout.getApprovedBy())
                .approvedAt(payout.getApprovedAt())
                .paidAt(payout.getPaidAt())
                .transactionRef(payout.getTransactionRef())
                .proofFileId(payout.getProofFileId())
                .createdAt(payout.getCreatedAt())
                .updatedAt(payout.getUpdatedAt())
                .build();
    }

    private void notifyOrganizer(Long organizerId, String subject, String body) {
        try {
            User user = userService.findById(organizerId);
            if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendTicketEmail(user.getEmail(), subject, body);
            }
        } catch (Exception ignored) {
            // Notification failures must not break the payout transaction.
        }
    }

    private String formatCurrency(long amount) {
        return String.format("%,d", amount).replace(',', '.');
    }
}
