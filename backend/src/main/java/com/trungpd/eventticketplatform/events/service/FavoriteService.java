package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.common.mapper.PaginationMapper;
import com.trungpd.eventticketplatform.common.response.PagedResponse;
import com.trungpd.eventticketplatform.events.dto.response.EventResponse;
import com.trungpd.eventticketplatform.events.entity.Event;
import com.trungpd.eventticketplatform.events.entity.Favorite;
import com.trungpd.eventticketplatform.events.mapper.EventMapper;
import com.trungpd.eventticketplatform.events.repository.EventRepository;
import com.trungpd.eventticketplatform.events.repository.FavoriteRepository;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final UserService userService;
    private final PaginationMapper paginationMapper;

    @Transactional
    public void addFavorite(String email, Long eventId) {
        User user = userService.findByEmail(email);
        validateEventExists(eventId);

        if (favoriteRepository.existsByCustomerIdAndEventId(user.getId(), eventId)) {
            throw new BusinessException("error.favorite.already-exists");
        }

        Favorite favorite = new Favorite();
        favorite.setCustomerId(user.getId());
        favorite.setEventId(eventId);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String email, Long eventId) {
        User user = userService.findByEmail(email);
        Favorite favorite = favoriteRepository.findByCustomerIdAndEventId(user.getId(), eventId)
                .orElseThrow(() -> new NotFoundException("error.favorite.not-found"));
        favoriteRepository.delete(favorite);
    }

    @Transactional(readOnly = true)
    public PagedResponse<EventResponse> getFavorites(String email, int page, int size) {
        User user = userService.findByEmail(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by("f.createdAt").descending());
        Page<Event> events = favoriteRepository.findFavoriteEventsByCustomerId(user.getId(), pageable);
        Page<EventResponse> responsePage = events.map(eventMapper::toResponse);
        return paginationMapper.toPagedResponse(responsePage);
    }

    private void validateEventExists(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new NotFoundException("error.event.not-found");
        }
    }

}
