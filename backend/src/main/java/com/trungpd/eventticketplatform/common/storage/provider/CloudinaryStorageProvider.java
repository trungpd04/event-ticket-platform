package com.trungpd.eventticketplatform.common.storage.provider;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.trungpd.eventticketplatform.common.storage.config.CloudinaryProperties;
import com.trungpd.eventticketplatform.common.storage.dto.response.FileUploadResponse;
import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import com.trungpd.eventticketplatform.common.storage.enums.PlatformType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CloudinaryStorageProvider implements StorageProvider {

    private final Cloudinary cloudinary;
    private final CloudinaryProperties cloudinaryProperties;

    @Override
    public FileUploadResponse upload(MultipartFile file, FileType fileType) throws IOException {
        String folder = buildFolder(fileType);
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image"
        );

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

        return FileUploadResponse.builder()
                .url((String) uploadResult.get("secure_url"))
                .publicId((String) uploadResult.get("public_id"))
                .platformType(PlatformType.CLOUDINARY)
                .fileType(fileType)
                .contentType(file.getContentType())
                .sizeBytes(file.getSize())
                .build();
    }

    @Override
    public PlatformType getPlatformType() {
        return PlatformType.CLOUDINARY;
    }

    private String buildFolder(FileType fileType) {
        String baseFolder = cloudinaryProperties.getFolder();
        String subFolder = switch (fileType) {
            case EVENT_THUMBNAIL -> "events/thumbnails";
            case BANNER -> "banners";
        };
        return baseFolder + "/" + subFolder;
    }
}
