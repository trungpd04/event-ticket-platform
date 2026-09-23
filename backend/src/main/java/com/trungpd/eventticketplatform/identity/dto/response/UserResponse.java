package com.trungpd.eventticketplatform.identity.dto.response;

import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Set<Role> roles;
    private UserStatus status;

}
