package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.dto.request.OptionSetRequest;
import com.trungpd.eventticketplatform.events.dto.request.OptionSetValueRequest;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetDetailResponse;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetResponse;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetValueResponse;
import com.trungpd.eventticketplatform.events.entity.OptionSet;
import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
import com.trungpd.eventticketplatform.events.mapper.OptionSetMapper;
import com.trungpd.eventticketplatform.events.mapper.OptionSetValueMapper;
import com.trungpd.eventticketplatform.events.repository.OptionSetRepository;
import com.trungpd.eventticketplatform.events.repository.OptionSetValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OptionSetService {

    private final OptionSetRepository optionSetRepository;
    private final OptionSetValueRepository optionSetValueRepository;
    private final OptionSetMapper optionSetMapper;
    private final OptionSetValueMapper optionSetValueMapper;

    @Transactional(readOnly = true)
    public List<OptionSetResponse> getAllOptionSets() {
        return optionSetRepository.findAll().stream()
                .map(optionSetMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OptionSetDetailResponse getOptionSetByCode(String code) {
        OptionSet optionSet = findByCode(code);
        List<OptionSetValueResponse> values = optionSetValueRepository
                .findAllByOptionSetCodeOrderBySortOrderAsc(code)
                .stream()
                .map(optionSetValueMapper::toResponse)
                .toList();
        return optionSetMapper.toDetailResponse(optionSet, values);
    }

    @Transactional(readOnly = true)
    public List<OptionSetValueResponse> getValuesByCode(String code) {
        return optionSetValueRepository
                .findAllByOptionSetCodeAndStatusOrderBySortOrderAsc(code, "ACTIVE")
                .stream()
                .map(optionSetValueMapper::toResponse)
                .toList();
    }

    @Transactional
    public OptionSetResponse createOptionSet(OptionSetRequest request) {
        OptionSet optionSet = optionSetMapper.toEntity(request);
        OptionSet saved = optionSetRepository.save(optionSet);
        return optionSetMapper.toResponse(saved);
    }

    @Transactional
    public OptionSetResponse updateOptionSet(String code, OptionSetRequest request) {
        OptionSet optionSet = findByCode(code);
        optionSetMapper.updateEntityFromRequest(request, optionSet);
        OptionSet updated = optionSetRepository.save(optionSet);
        return optionSetMapper.toResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<OptionSetValueResponse> getValuesByOptionSetCode(String code) {
        return optionSetValueRepository
                .findAllByOptionSetCodeOrderBySortOrderAsc(code)
                .stream()
                .map(optionSetValueMapper::toResponse)
                .toList();
    }

    @Transactional
    public OptionSetValueResponse createOptionSetValue(String code, OptionSetValueRequest request) {
        OptionSet optionSet = findByCode(code);
        OptionSetValue value = optionSetValueMapper.toEntity(request, optionSet);
        OptionSetValue saved = optionSetValueRepository.save(value);
        return optionSetValueMapper.toResponse(saved);
    }

    @Transactional
    public OptionSetValueResponse updateOptionSetValue(String code, String valueCode, OptionSetValueRequest request) {
        OptionSetValue value = optionSetValueRepository
                .findByOptionSetCodeAndCode(code, valueCode)
                .orElseThrow(() -> new NotFoundException("error.option-set-value.not-found"));
        optionSetValueMapper.updateEntityFromRequest(request, value);
        OptionSetValue updated = optionSetValueRepository.save(value);
        return optionSetValueMapper.toResponse(updated);
    }

    @Transactional(readOnly = true)
    public OptionSet findByCode(String code) {
        return optionSetRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("error.option-set.not-found"));
    }

}
