package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;

public interface IFavoriteService {

    void addFavorite(Long userId, Long eventId);

    void removeFavorite(Long userId, Long eventId);

    PagedResponse<EventResponse> getFavorites(Long userId, int page, int size);
}
