package com.trungpd.eventticketplatform.operations.service;

import com.trungpd.eventticketplatform.operations.dto.request.CheckInRequest;
import com.trungpd.eventticketplatform.operations.dto.response.CheckInResponse;

public interface ICheckInService {

    CheckInResponse checkIn(Long checkerUserId, CheckInRequest request);
}
