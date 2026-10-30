package com.trungpd.eventticketplatform.common.util;

import com.trungpd.eventticketplatform.common.config.MessageSourceConfig;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

public class LocaleUtils {

    private LocaleUtils() {
    }

    public static boolean isVietnamese() {
        Locale locale = LocaleContextHolder.getLocale();
        if (locale == null) {
            return true;
        }
        String language = locale.getLanguage();
        return "vi".equalsIgnoreCase(language)
                || MessageSourceConfig.DEFAULT_LOCALE.getLanguage().equalsIgnoreCase(language);
    }
}
