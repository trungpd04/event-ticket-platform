package com.trungpd.eventticketplatform.events.mapper;

import com.trungpd.eventticketplatform.events.dto.request.EventPayoutInfoRequest;
import com.trungpd.eventticketplatform.events.dto.response.EventPayoutInfoResponse;
import com.trungpd.eventticketplatform.events.entity.EventPayoutInfo;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface EventPayoutInfoMapper {

    EventPayoutInfoResponse toResponse(EventPayoutInfo eventPayoutInfo);

    EventPayoutInfo toEntity(EventPayoutInfoRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(EventPayoutInfoRequest request, @MappingTarget EventPayoutInfo eventPayoutInfo);

}
