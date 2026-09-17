package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.dto.request.FeePolicyRequest;
import com.trungpd.eventticketplatform.events.dto.response.FeePolicyResponse;
import com.trungpd.eventticketplatform.events.entity.FeePolicy;
import com.trungpd.eventticketplatform.events.mapper.FeePolicyMapper;
import com.trungpd.eventticketplatform.events.repository.FeePolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeePolicyService {

    private final FeePolicyRepository feePolicyRepository;
    private final FeePolicyMapper feePolicyMapper;

    @Transactional(readOnly = true)
    public List<FeePolicyResponse> getAllFeePolicies() {
        return feePolicyRepository.findAll().stream()
                .map(feePolicyMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "feePolicies", key = "'active'")
    @Transactional(readOnly = true)
    public List<FeePolicyResponse> getActiveFeePolicies() {
        return feePolicyRepository.findAllByIsActiveTrue().stream()
                .map(feePolicyMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FeePolicy findActiveById(Long id) {
        return feePolicyRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new NotFoundException("error.fee-policy.not-found"));
    }

    @CacheEvict(value = "feePolicies", key = "'active'")
    @Transactional
    public FeePolicyResponse createFeePolicy(FeePolicyRequest request) {
        FeePolicy feePolicy = feePolicyMapper.toEntity(request);
        FeePolicy saved = feePolicyRepository.save(feePolicy);
        return feePolicyMapper.toResponse(saved);
    }

    @CacheEvict(value = "feePolicies", key = "'active'")
    @Transactional
    public FeePolicyResponse updateFeePolicy(Long id, FeePolicyRequest request) {
        FeePolicy feePolicy = feePolicyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.fee-policy.not-found"));

        feePolicyMapper.updateEntityFromRequest(request, feePolicy);
        FeePolicy updated = feePolicyRepository.save(feePolicy);
        return feePolicyMapper.toResponse(updated);
    }

}
