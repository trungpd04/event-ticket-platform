package com.trungpd.eventticketplatform.common.storage.dto.response;

import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import com.trungpd.eventticketplatform.common.storage.enums.PlatformType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FileUploadResponse {

    private Long id;
    private String url;
    private String publicId;
    private PlatformType platformType;
    private FileType fileType;
    private String contentType;
    private Long sizeBytes;
    private Integer width;
    private Integer height;
}
