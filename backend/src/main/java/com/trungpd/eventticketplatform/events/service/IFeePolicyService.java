package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.request.FeePolicyRequest;
import com.trungpd.eventticketplatform.events.dto.response.FeePolicyResponse;
import com.trungpd.eventticketplatform.events.entity.FeePolicy;

import java.util.List;

public interface IFeePolicyService {

    List<FeePolicyResponse> getAllFeePolicies();

    List<FeePolicyResponse> getActiveFeePolicies();

    FeePolicy findActiveById(Long id);

    FeePolicy findDefaultActivePolicy();

    FeePolicyResponse createFeePolicy(FeePolicyRequest request);

    FeePolicyResponse updateFeePolicy(Long id, FeePolicyRequest request);
}
