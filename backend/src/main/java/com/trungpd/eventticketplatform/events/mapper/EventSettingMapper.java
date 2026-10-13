package com.trungpd.eventticketplatform.events.mapper;

import com.trungpd.eventticketplatform.events.dto.request.EventSettingRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventSettingResponse;
import com.trungpd.eventticketplatform.events.entity.EventSetting;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface EventSettingMapper {

    EventSettingResponse toResponse(EventSetting eventSetting);

    EventSetting toEntity(EventSettingRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(EventSettingRequest request, @MappingTarget EventSetting eventSetting);

}
