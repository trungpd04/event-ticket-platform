package com.trungpd.eventticketplatform.common.storage.mapper;

import com.trungpd.eventticketplatform.common.storage.dto.response.FileUploadResponse;
import com.trungpd.eventticketplatform.common.storage.entity.FileEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FileMapper {

    @Mapping(target = "id", source = "id")
    FileUploadResponse toResponse(FileEntity fileEntity);
}
