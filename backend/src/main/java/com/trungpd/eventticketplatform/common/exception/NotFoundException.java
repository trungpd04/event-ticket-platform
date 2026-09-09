package com.trungpd.eventticketplatform.common.exception;

public class NotFoundException extends BusinessException {

    public NotFoundException(String messageKey) {
        super(messageKey);
    }

}
