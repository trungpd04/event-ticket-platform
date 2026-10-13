package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class EventSettingRequest {

    private String refundPolicy;

    private String ageRestriction;

    private List<String> tags;

    @NotNull(message = "{error.event.settings.is-public-required}")
    private Boolean isPublic;

}
