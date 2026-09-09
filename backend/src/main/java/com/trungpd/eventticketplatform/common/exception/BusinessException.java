package com.trungpd.eventticketplatform.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final String messageKey;

    public BusinessException(String messageKey) {
        super(messageKey);
        this.messageKey = messageKey;
    }

}
