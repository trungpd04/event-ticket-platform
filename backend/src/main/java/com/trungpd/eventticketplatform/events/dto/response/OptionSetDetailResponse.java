package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OptionSetDetailResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private String status;
    private List<OptionSetValueResponse> values;

}
