package com.trungpd.eventticketplatform.finance.payout.service;

import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.finance.payout.PayoutStatus;
import com.trungpd.eventticketplatform.finance.payout.dto.request.ApprovePayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.request.CreatePayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.request.MarkPaidRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.request.RejectPayoutRequest;
import com.trungpd.eventticketplatform.finance.payout.dto.response.PayoutResponse;
import com.trungpd.eventticketplatform.finance.payout.dto.response.PayoutSummaryResponse;

public interface IPayoutService {

    PayoutSummaryResponse getSummary(Long organizerId, Long eventId);

    PayoutResponse create(Long organizerId, CreatePayoutRequest request);

    PagedResponse<PayoutResponse> listByOrganizer(Long organizerId, PayoutStatus status, int page, int size);

    PayoutResponse getByOrganizer(Long organizerId, Long id);

    PayoutResponse cancelByOrganizer(Long organizerId, Long id);

    PagedResponse<PayoutResponse> listAll(PayoutStatus status, Long organizerId, Long eventId, int page, int size);

    PayoutResponse get(Long id);

    PayoutResponse approve(Long adminId, Long id, ApprovePayoutRequest request);

    PayoutResponse reject(Long adminId, Long id, RejectPayoutRequest request);

    PayoutResponse markPaid(Long adminId, Long id, MarkPaidRequest request);

    long countPending();
}
