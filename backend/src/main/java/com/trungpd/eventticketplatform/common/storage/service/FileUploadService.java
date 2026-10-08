package com.trungpd.eventticketplatform.common.storage.service;

import com.trungpd.eventticketplatform.common.storage.dto.response.FileUploadResponse;
import com.trungpd.eventticketplatform.common.storage.entity.FileEntity;
import com.trungpd.eventticketplatform.common.storage.config.StorageProperties;
import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import com.trungpd.eventticketplatform.common.storage.enums.PlatformType;
import com.trungpd.eventticketplatform.common.storage.exception.FileValidationException;
import com.trungpd.eventticketplatform.common.storage.mapper.FileMapper;
import com.trungpd.eventticketplatform.common.storage.provider.StorageProvider;
import com.trungpd.eventticketplatform.common.storage.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.Dimension;
import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final FileValidationService fileValidationService;
    private final FileRepository fileRepository;
    private final FileMapper fileMapper;
    private final StorageProperties storageProperties;
    private final List<StorageProvider> storageProviders;

    public FileUploadResponse upload(MultipartFile file, Integer typeCode, String uploadedBy) {
        FileType fileType = resolveFileType(typeCode);
        fileValidationService.validate(file, fileType);

        StorageProvider provider = resolveProvider();

        try {
            FileUploadResponse uploadResponse = provider.upload(file, fileType);
            Dimension dimension = fileValidationService.readImageDimension(file);

            FileEntity fileEntity = FileEntity.builder()
                    .url(uploadResponse.getUrl())
                    .publicId(uploadResponse.getPublicId())
                    .platformType(uploadResponse.getPlatformType())
                    .fileType(fileType)
                    .contentType(file.getContentType())
                    .sizeBytes(file.getSize())
                    .width(dimension.width)
                    .height(dimension.height)
                    .uploadedBy(uploadedBy)
                    .build();

            FileEntity saved = fileRepository.save(fileEntity);
            FileUploadResponse response = fileMapper.toResponse(saved);
            return response;
        } catch (IOException e) {
            log.error("Failed to upload file to cloud storage", e);
            throw new FileValidationException("error.file.upload.failed");
        } catch (Exception e) {
            log.error("Unexpected error during file upload", e);
            throw new FileValidationException("error.file.upload.failed");
        }
    }

    private FileType resolveFileType(Integer typeCode) {
        try {
            return FileType.fromCode(typeCode);
        } catch (IllegalArgumentException e) {
            throw new FileValidationException("error.file.type.invalid");
        }
    }

    private StorageProvider resolveProvider() {
        String activeProvider = storageProperties.getActiveProvider();
        return storageProviders.stream()
                .filter(p -> p.getPlatformType().name().equalsIgnoreCase(activeProvider))
                .findFirst()
                .orElseThrow(() -> new FileValidationException("error.file.upload.failed"));
    }
}
