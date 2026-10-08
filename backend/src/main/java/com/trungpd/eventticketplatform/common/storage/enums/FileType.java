package com.trungpd.eventticketplatform.common.storage.enums;

import lombok.Getter;

import java.util.Arrays;
import java.util.Set;

@Getter
public enum FileType {

    EVENT_THUMBNAIL(1, 720, 958, 1_048_576L,
            Set.of("image/jpeg", "image/png", "image/webp")),
    BANNER(2, 1280, 720, null,
            Set.of("image/jpeg", "image/png", "image/webp"));

    private final int code;
    private final int maxWidth;
    private final int maxHeight;
    private final Long maxSizeBytes;
    private final Set<String> allowedContentTypes;

    FileType(int code, int maxWidth, int maxHeight, Long maxSizeBytes, Set<String> allowedContentTypes) {
        this.code = code;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.maxSizeBytes = maxSizeBytes;
        this.allowedContentTypes = allowedContentTypes;
    }

    public static FileType fromCode(int code) {
        return Arrays.stream(values())
                .filter(type -> type.code == code)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid file type code: " + code));
    }
}
