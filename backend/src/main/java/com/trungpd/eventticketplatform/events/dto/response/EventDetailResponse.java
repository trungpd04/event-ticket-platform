package com.trungpd.eventticketplatform.events.dto.response;

import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.ticketing.dto.response.TicketTypeResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class EventDetailResponse {

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
    private List<TicketTypeResponse> ticketTypes;
    private List<PromotionResponse> activePromotions;

}
