package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OptionSetResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private String status;

}
