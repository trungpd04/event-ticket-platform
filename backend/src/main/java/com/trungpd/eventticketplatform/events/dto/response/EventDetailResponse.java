package com.trungpd.eventticketplatform.events.dto.response;

import com.trungpd.eventticketplatform.events.entity.EventStatus;
import com.trungpd.eventticketplatform.ticketing.dto.response.TicketTypeResponse;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class EventDetailResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private Instant startTime;
    private Instant endTime;
    private String coverImageUrl;
    private EventStatus status;
    private Long organizerId;
    private Long feePolicyId;
    private CategoryResponse category;
    private ProvinceResponse province;
    private Instant ticketSaleStartTime;
    private Instant ticketSaleEndTime;
    private FeePolicySnapshotResponse feePolicySnapshot;
    private List<TicketTypeResponse> ticketTypes;
    private List<PromotionResponse> activePromotions;

}
