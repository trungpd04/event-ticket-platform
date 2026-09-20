package com.trungpd.eventticketplatform.events.mapper;

import com.trungpd.eventticketplatform.events.dto.response.ProvinceResponse;
import com.trungpd.eventticketplatform.events.dto.response.WardResponse;
import com.trungpd.eventticketplatform.events.entity.Province;
import com.trungpd.eventticketplatform.events.entity.Ward;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LocationMapper {

    ProvinceResponse toProvinceResponse(Province province);

    WardResponse toWardResponse(Ward ward);

}
