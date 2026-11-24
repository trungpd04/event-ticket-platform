package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
import com.trungpd.eventticketplatform.events.repository.OptionSetValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlatformConfigService {

    private final OptionSetValueRepository optionSetValueRepository;

    @Transactional(readOnly = true)
    public String getString(String optionSetCode, String valueCode, String defaultValue) {
        return optionSetValueRepository.findByOptionSetCodeAndCode(optionSetCode, valueCode)
                .map(OptionSetValue::getValue)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .orElse(defaultValue);
    }

    @Transactional(readOnly = true)
    public int getInt(String optionSetCode, String valueCode, int defaultValue) {
        String value = getString(optionSetCode, valueCode, null);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    @Transactional(readOnly = true)
    public long getLong(String optionSetCode, String valueCode, long defaultValue) {
        String value = getString(optionSetCode, valueCode, null);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
