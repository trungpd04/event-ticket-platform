package com.trungpd.eventticketplatform.events.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private String iconUrl;
    private Boolean isActive;

}
