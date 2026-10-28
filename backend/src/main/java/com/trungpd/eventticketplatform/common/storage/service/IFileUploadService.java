package com.trungpd.eventticketplatform.common.storage.service;

import com.trungpd.eventticketplatform.common.storage.dto.response.FileUploadResponse;
import com.trungpd.eventticketplatform.common.storage.entity.FileEntity;
import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

public interface IFileUploadService {

    FileUploadResponse upload(MultipartFile file, Integer typeCode, String uploadedBy);

    FileEntity findById(Long fileId);

    void validateEventImage(Long fileId, FileType expectedType, String uploadedByEmail);

    void linkToEvent(Long fileId, Long eventId);

    void unlinkFromEvent(Long fileId);

    String getFileUrl(Long fileId);

    Optional<FileEntity> findByReferenceIdAndType(Long eventId, FileType fileType);
}
