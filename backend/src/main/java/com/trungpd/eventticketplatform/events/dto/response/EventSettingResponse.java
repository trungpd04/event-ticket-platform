package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EventSettingResponse {

    private String refundPolicy;

    private String ageRestriction;

    private List<String> tags;

    private Boolean isPublic;

}
