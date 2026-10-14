package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OptionSetValueResponse {

    private Long id;
    private String code;
    private String name;
    private String value;
    private String color;
    private Integer sortOrder;
    private String status;

}
