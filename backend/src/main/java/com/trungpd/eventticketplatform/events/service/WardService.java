package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.response.WardResponse;
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
    public List<WardResponse> getWardsByProvince(Long provinceId) {
        provinceService.findById(provinceId);
        return wardRepository.findByProvinceIdOrderByNameAsc(provinceId).stream()
                .map(locationMapper::toWardResponse)
                .toList();
    }

}
