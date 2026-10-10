package com.trungpd.eventticketplatform.events.mapper;

import com.trungpd.eventticketplatform.events.dto.request.OptionSetRequest;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetDetailResponse;
import com.trungpd.eventticketplatform.events.dto.response.OptionSetResponse;
import com.trungpd.eventticketplatform.events.entity.OptionSet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.BeanMapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = OptionSetValueMapper.class)
public interface OptionSetMapper {

    OptionSetResponse toResponse(OptionSet optionSet);

    OptionSetDetailResponse toDetailResponse(OptionSet optionSet);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "values", ignore = true)
    OptionSet toEntity(OptionSetRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "values", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(OptionSetRequest request, @MappingTarget OptionSet optionSet);

    default OptionSetDetailResponse toDetailResponse(OptionSet optionSet, List<OptionSetValueResponse> values) {
        if (optionSet == null) {
            return null;
        }
        return OptionSetDetailResponse.builder()
                .id(optionSet.getId())
                .code(optionSet.getCode())
                .name(optionSet.getName())
                .description(optionSet.getDescription())
                .status(optionSet.getStatus())
                .values(values)
                .build();
    }

}
