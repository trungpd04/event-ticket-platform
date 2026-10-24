package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.response.WardResponse;
import com.trungpd.eventticketplatform.events.entity.Ward;

import java.util.List;

public interface IWardService {

    List<WardResponse> getWardsByProvince(String provinceCode);

    Ward findById(Long id);
}
