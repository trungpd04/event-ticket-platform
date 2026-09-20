package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProvinceResponse {

    private Long id;
    private String provinceCode;
    private String name;

}
