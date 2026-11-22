package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.Valid;
import lombok.Data;

@Data
public class PublishedEventUpdateRequest {

    private String description;

    private Long thumbnailFileId;

    private Long bannerFileId;

    private Long categoryId;

    @Valid
    private EventSettingRequest settings;

    @Valid
    private EventPayoutInfoRequest payoutInfo;

}
