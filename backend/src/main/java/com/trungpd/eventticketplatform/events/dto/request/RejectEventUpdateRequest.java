package com.trungpd.eventticketplatform.events.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RejectEventUpdateRequest {

    @NotBlank(message = "{error.event-update-request.rejection-reason-required}")
    @Size(max = 500, message = "{error.event-update-request.rejection-reason-too-long}")
    private String rejectionReason;

}
