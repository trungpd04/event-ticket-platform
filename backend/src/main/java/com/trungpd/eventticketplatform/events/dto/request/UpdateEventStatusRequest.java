package com.trungpd.eventticketplatform.events.dto.request;

import com.trungpd.eventticketplatform.events.entity.EventStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateEventStatusRequest {

    @NotNull(message = "{error.validation.event-status-required}")
    private EventStatus status;

}
