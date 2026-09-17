package com.trungpd.eventticketplatform.ticketing.mapper;

import com.trungpd.eventticketplatform.ticketing.dto.response.TicketTypeResponse;
import com.trungpd.eventticketplatform.ticketing.entity.TicketType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TicketTypeMapper {

    TicketTypeResponse toResponse(TicketType ticketType);

}
