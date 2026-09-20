package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.dto.response.ProvinceResponse;
import com.trungpd.eventticketplatform.events.entity.Province;
import com.trungpd.eventticketplatform.events.mapper.LocationMapper;
import com.trungpd.eventticketplatform.events.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final LocationMapper locationMapper;

    @Transactional(readOnly = true)
    public List<ProvinceResponse> getAllProvinces() {
        return provinceRepository.findAll().stream()
                .map(locationMapper::toProvinceResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Province findById(Long id) {
        return provinceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.province.not-found"));
    }

}
