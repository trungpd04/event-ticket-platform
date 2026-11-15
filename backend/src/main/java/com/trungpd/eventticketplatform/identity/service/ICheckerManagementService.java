package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.identity.dto.request.CreateCheckerRequest;
import com.trungpd.eventticketplatform.identity.dto.request.UpdateCheckerStatusRequest;
import com.trungpd.eventticketplatform.identity.dto.response.UserResponse;

import java.util.List;

public interface ICheckerManagementService {

    List<UserResponse> findAllCheckers();

    UserResponse createChecker(CreateCheckerRequest request);

    UserResponse updateStatus(Long checkerId, UpdateCheckerStatusRequest request);
}
