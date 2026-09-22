package com.trungpd.eventticketplatform.events.dto.request;

import lombok.Data;

import java.time.Instant;

@Data
public class UpdateEventRequest {

    private String title;
    private String description;
    private String location;
    private Instant startTime;
    private Instant endTime;
    private String coverImageUrl;
    private Long categoryId;
    private Long provinceId;
    private Instant ticketSaleStartTime;
    private Instant ticketSaleEndTime;

}
