package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.dto.response.WardResponse;
import com.trungpd.eventticketplatform.events.entity.Ward;
import com.trungpd.eventticketplatform.events.mapper.LocationMapper;
import com.trungpd.eventticketplatform.events.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WardService {

    private final WardRepository wardRepository;
    private final ProvinceService provinceService;
    private final LocationMapper locationMapper;

    @Transactional(readOnly = true)
    public List<WardResponse> getWardsByProvince(String provinceCode) {
        provinceService.findByProvinceCode(provinceCode);
        return wardRepository.findByProvinceCodeOrderByNameAsc(provinceCode).stream()
                .map(locationMapper::toWardResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Ward findById(Long id) {
        return wardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.ward.not-found"));
    }

}
