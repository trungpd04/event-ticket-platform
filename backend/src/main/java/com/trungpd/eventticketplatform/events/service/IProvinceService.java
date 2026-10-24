package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.response.ProvinceResponse;
import com.trungpd.eventticketplatform.events.entity.Province;

import java.util.List;

public interface IProvinceService {

    List<ProvinceResponse> getAllProvinces();

    Province findById(Long id);

    Province findByProvinceCode(String provinceCode);
}
