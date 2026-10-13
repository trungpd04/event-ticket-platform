package com.trungpd.eventticketplatform.common.storage.exception;

import com.trungpd.eventticketplatform.common.exception.BusinessException;

public class FileValidationException extends BusinessException {

    public FileValidationException(String messageKey) {
        super(messageKey);
    }
}
