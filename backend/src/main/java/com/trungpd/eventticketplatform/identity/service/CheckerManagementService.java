package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.identity.dto.request.CreateCheckerRequest;
import com.trungpd.eventticketplatform.identity.dto.request.UpdateCheckerStatusRequest;
import com.trungpd.eventticketplatform.identity.dto.response.UserResponse;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import com.trungpd.eventticketplatform.identity.mapper.UserMapper;
import com.trungpd.eventticketplatform.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CheckerManagementService implements ICheckerManagementService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAllCheckers() {
        return userRepository.findAllByRole(Role.CHECKER).stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse createChecker(CreateCheckerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("error.user.email-exists");
        }

        User checker = new User();
        checker.setEmail(request.getEmail());
        checker.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        checker.setFullName(request.getFullName());
        checker.setPhone(request.getPhone());
        checker.setRoles(Set.of(Role.CHECKER));
        checker.setStatus(UserStatus.ACTIVE);

        return userMapper.toResponse(userRepository.save(checker));
    }

    @Override
    @Transactional
    public UserResponse updateStatus(Long checkerId, UpdateCheckerStatusRequest request) {
        User checker = userRepository.findById(checkerId)
                .orElseThrow(() -> new NotFoundException("error.checker.not-found"));

        if (checker.getRoles() == null || !checker.getRoles().contains(Role.CHECKER)) {
            throw new BusinessException("error.checker.user-not-checker");
        }

        checker.setStatus(request.getStatus());
        return userMapper.toResponse(userRepository.save(checker));
    }
}
