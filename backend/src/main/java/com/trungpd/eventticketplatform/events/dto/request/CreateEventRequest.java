package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateEventRequest {

    @NotBlank(message = "{error.validation.title-required}")
    private String title;

    private String description;

    @NotBlank(message = "{error.validation.location-required}")
    private String location;

    @NotNull(message = "{error.validation.start-time-required}")
    private LocalDateTime startTime;

    @NotNull(message = "{error.validation.end-time-required}")
    private LocalDateTime endTime;

    @NotNull(message = "{error.validation.thumbnail-required}")
    private Long thumbnailFileId;

    @NotNull(message = "{error.validation.banner-required}")
    private Long bannerFileId;

    @NotNull(message = "{error.validation.category-required}")
    private Long categoryId;

    @NotNull(message = "{error.validation.province-required}")
    private Long provinceId;

    @NotNull(message = "{error.validation.ticket-sale-start-required}")
    private LocalDateTime ticketSaleStartTime;

    @NotNull(message = "{error.validation.ticket-sale-end-required}")
    private LocalDateTime ticketSaleEndTime;

}
