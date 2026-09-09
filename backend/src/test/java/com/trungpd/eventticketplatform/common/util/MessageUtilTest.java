package com.trungpd.eventticketplatform.common.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageUtilTest {

    @Mock
    private MessageSource messageSource;

    private MessageUtil messageUtil;

    @BeforeEach
    void setUp() {
        messageUtil = new MessageUtil(messageSource);
    }

    @Test
    void shouldReturnMessageForCurrentLocale() {
        LocaleContextHolder.setLocale(Locale.forLanguageTag("vi-VN"));
        when(messageSource.getMessage("error.user.not-found", null, Locale.forLanguageTag("vi-VN")))
                .thenReturn("Không tìm thấy ngưởi dùng");

        String message = messageUtil.getMessage("error.user.not-found");

        assertThat(message).isEqualTo("Không tìm thấy ngưởi dùng");
    }

    @Test
    void shouldReturnMessageWithArgs() {
        LocaleContextHolder.setLocale(Locale.forLanguageTag("en-US"));
        Object[] args = {"Event"};
        when(messageSource.getMessage("error.not-found", args, Locale.forLanguageTag("en-US")))
                .thenReturn("Event not found");

        String message = messageUtil.getMessage("error.not-found", args);

        assertThat(message).isEqualTo("Event not found");
    }

}
