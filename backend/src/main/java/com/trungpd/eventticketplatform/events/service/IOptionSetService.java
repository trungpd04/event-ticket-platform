package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.request.OptionSetRequest;
import com.trungpd.eventticketplatform.events.dto.request.OptionSetValueRequest;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetDetailResponse;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetResponse;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetValueResponse;
import com.trungpd.eventticketplatform.events.entity.OptionSet;

import java.util.List;

public interface IOptionSetService {

    List<OptionSetResponse> getAllOptionSets();

    OptionSetDetailResponse getOptionSetByCode(String code);

    List<OptionSetValueResponse> getValuesByCode(String code);

    OptionSetResponse createOptionSet(OptionSetRequest request);

    OptionSetResponse updateOptionSet(String code, OptionSetRequest request);

    List<OptionSetValueResponse> getValuesByOptionSetCode(String code);

    OptionSetValueResponse createOptionSetValue(String code, OptionSetValueRequest request);

    OptionSetValueResponse updateOptionSetValue(String code, String valueCode, OptionSetValueRequest request);

    OptionSet findByCode(String code);
}
