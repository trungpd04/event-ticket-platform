package com.trungpd.eventticketplatform.events.mapper;

import com.trungpd.eventticketplatform.events.dto.request.OptionSetValueRequest;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetValueResponse;
import com.trungpd.eventticketplatform.events.entity.OptionSet;
import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.BeanMapping;

@Mapper(componentModel = "spring")
public interface OptionSetValueMapper {

    OptionSetValueResponse toResponse(OptionSetValue optionSetValue);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "optionSet", ignore = true)
    OptionSetValue toEntity(OptionSetValueRequest request);

    default OptionSetValue toEntity(OptionSetValueRequest request, OptionSet optionSet) {
        OptionSetValue value = toEntity(request);
        value.setOptionSet(optionSet);
        return value;
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "optionSet", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(OptionSetValueRequest request, @MappingTarget OptionSetValue optionSetValue);

}
