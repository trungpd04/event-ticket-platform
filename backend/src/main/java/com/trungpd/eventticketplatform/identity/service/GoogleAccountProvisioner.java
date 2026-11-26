package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.identity.dto.response.GoogleUserInfo;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import com.trungpd.eventticketplatform.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GoogleAccountProvisioner {
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User create(GoogleUserInfo info) {
        User user = new User();
        user.setEmail(info.email().trim().toLowerCase(Locale.ROOT));
        user.setGoogleSubject(info.sub());
        user.setFullName(info.name());
        user.setAvatarUrl(info.picture());
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(Set.of(Role.CUSTOMER, Role.ORGANIZER));
        return userRepository.saveAndFlush(user);
    }
}
