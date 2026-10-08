package com.trungpd.eventticketplatform.common.storage.provider;

import com.trungpd.eventticketplatform.common.storage.dto.response.FileUploadResponse;
import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import com.trungpd.eventticketplatform.common.storage.enums.PlatformType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageProvider {

    FileUploadResponse upload(MultipartFile file, FileType fileType) throws IOException;

    PlatformType getPlatformType();
}
