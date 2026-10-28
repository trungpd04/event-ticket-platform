package com.trungpd.eventticketplatform.common.storage.service;

import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import org.springframework.web.multipart.MultipartFile;

import java.awt.Dimension;

public interface IFileValidationService {

    void validate(MultipartFile file, FileType fileType);

    Dimension readImageDimension(MultipartFile file);
}
