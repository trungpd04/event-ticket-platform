package com.trungpd.eventticketplatform.events.mapper;

import com.trungpd.eventticketplatform.events.dto.response.ProvinceResponse;
import com.trungpd.eventticketplatform.events.dto.response.WardResponse;
import com.trungpd.eventticketplatform.events.entity.Province;
import com.trungpd.eventticketplatform.events.entity.Ward;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.trungpd.eventticketplatform.common.util.LocaleUtils;

@Mapper(componentModel = "spring")
public interface LocationMapper {

    @Mapping(target = "name", expression = "java(isVietnamese() ? province.getShortNameVI() : province.getName())")
    ProvinceResponse toProvinceResponse(Province province);

    @Mapping(target = "name", expression = "java(isVietnamese() ? ward.getNameVI() : ward.getName())")
    WardResponse toWardResponse(Ward ward);

    default boolean isVietnamese(){
        return LocaleUtils.isVietnamese();
    }
}
