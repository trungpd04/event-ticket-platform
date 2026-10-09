package com.trungpd.eventticketplatform.events.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateEventRequest {

    private String title;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long thumbnailFileId;
    private Long bannerFileId;
    private Long categoryId;
    private Long provinceId;
    private LocalDateTime ticketSaleStartTime;
    private LocalDateTime ticketSaleEndTime;

}
