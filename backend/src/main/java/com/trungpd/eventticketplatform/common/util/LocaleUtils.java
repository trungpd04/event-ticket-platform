package com.trungpd.eventticketplatform.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

@Slf4j
public class LocaleUtils {

    private LocaleUtils() {
    }

    public static Locale getCurrentLocale() {
        return LocaleContextHolder.getLocale();
    }

    public static String getLanguage() {
        return getCurrentLocale().getLanguage();
    }

    public static boolean isVietnamese() {
        return "vi".equalsIgnoreCase(getLanguage());
    }
}
