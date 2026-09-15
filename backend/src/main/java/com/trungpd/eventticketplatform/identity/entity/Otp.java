package com.trungpd.eventticketplatform.identity.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "otps")
@Getter
@Setter
@NoArgsConstructor
public class Otp extends BaseEntity {

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "code", nullable = false, length = 10)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private OtpType type;

    @Column(name = "expired_at", nullable = false)
    private Instant expiredAt;

    @Column(name = "is_used", nullable = false)
    private boolean isUsed;

}
