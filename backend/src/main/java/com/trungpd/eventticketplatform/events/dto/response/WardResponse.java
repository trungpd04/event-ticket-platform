package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WardResponse {

    private Long id;
    private String wardCode;
    private String name;

}
