package com.trungpd.eventticketplatform.events.dto.response;

import com.trungpd.eventticketplatform.events.entity.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String thumbnailUrl;
    private Long thumbnailFileId;
    private String bannerUrl;
    private Long bannerFileId;
    private EventStatus status;
    private Long organizerId;
    private Long feePolicyId;
    private CategoryResponse category;
    private ProvinceResponse province;
    private LocalDateTime ticketSaleStartTime;
    private LocalDateTime ticketSaleEndTime;
    private FeePolicySnapshotResponse feePolicySnapshot;

}
