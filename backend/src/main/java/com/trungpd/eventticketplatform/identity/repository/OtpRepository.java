package com.trungpd.eventticketplatform.identity.repository;

import com.trungpd.eventticketplatform.identity.entity.Otp;
import com.trungpd.eventticketplatform.identity.entity.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {

    Optional<Otp> findTopByEmailAndCodeAndTypeOrderByCreatedAtDesc(String email, String code, OtpType type);

}
