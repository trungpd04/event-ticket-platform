package com.trungpd.eventticketplatform.common.storage.service;

import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import com.trungpd.eventticketplatform.common.storage.exception.FileValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.Dimension;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;

@Slf4j
@Service
public class FileValidationService {

    public void validate(MultipartFile file, FileType fileType) {
        validateNotEmpty(file);
        validateContentType(file, fileType);
        validateSize(file, fileType);
        validateDimensions(file, fileType);
    }

    private void validateNotEmpty(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("error.file.empty");
        }
    }

    private void validateContentType(MultipartFile file, FileType fileType) {
        String contentType = file.getContentType();
        if (contentType == null || !fileType.getAllowedContentTypes().contains(contentType.toLowerCase())) {
            throw new FileValidationException("error.file.content-type.invalid");
        }
    }

    private void validateSize(MultipartFile file, FileType fileType) {
        Long maxSize = fileType.getMaxSizeBytes();
        if (maxSize != null && file.getSize() > maxSize) {
            throw new FileValidationException("error.file.size.exceeded");
        }
    }

    private void validateDimensions(MultipartFile file, FileType fileType) {
        Dimension dimension = readImageDimension(file);
        if (dimension.width > fileType.getMaxWidth() || dimension.height > fileType.getMaxHeight()) {
            throw new FileValidationException("error.file.dimension.invalid");
        }
    }

    public Dimension readImageDimension(MultipartFile file) {
        try (InputStream is = file.getInputStream();
             ImageInputStream iis = ImageIO.createImageInputStream(is)) {

            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (!readers.hasNext()) {
                throw new FileValidationException("error.file.content-type.invalid");
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(iis);
                return new Dimension(reader.getWidth(0), reader.getHeight(0));
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            log.error("Failed to read image dimensions", e);
            throw new FileValidationException("error.file.dimension.invalid");
        }
    }
}
