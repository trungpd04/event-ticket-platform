package com.trungpd.eventticketplatform.common.exception;

public class UnauthorizedException extends BusinessException {
    public UnauthorizedException(String messageKey) {
        super(messageKey);
    }
}
