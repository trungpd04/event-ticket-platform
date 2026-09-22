package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateEventRequest {

    @NotBlank(message = "{error.validation.title-required}")
    private String title;

    private String description;

    @NotBlank(message = "{error.validation.location-required}")
    private String location;

    @NotNull(message = "{error.validation.start-time-required}")
    private Instant startTime;

    @NotNull(message = "{error.validation.end-time-required}")
    private Instant endTime;

    private String coverImageUrl;

    @NotNull(message = "{error.validation.category-required}")
    private Long categoryId;

    @NotNull(message = "{error.validation.province-required}")
    private Long provinceId;

    @NotNull(message = "{error.validation.ticket-sale-start-required}")
    private Instant ticketSaleStartTime;

    @NotNull(message = "{error.validation.ticket-sale-end-required}")
    private Instant ticketSaleEndTime;

}
