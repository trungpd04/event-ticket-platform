package com.trungpd.eventticketplatform.identity.dto.request;

import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCheckerStatusRequest {

    @NotNull
    private UserStatus status;
}
