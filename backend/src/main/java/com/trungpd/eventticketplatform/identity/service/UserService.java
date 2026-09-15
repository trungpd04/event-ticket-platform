package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.identity.dto.request.UpdateProfileRequest;
import com.trungpd.eventticketplatform.identity.dto.response.UserResponse;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.mapper.UserMapper;
import com.trungpd.eventticketplatform.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("error.user.not-found"));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = findByEmail(email);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);
        userMapper.updateEntityFromRequest(request, user);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

}
