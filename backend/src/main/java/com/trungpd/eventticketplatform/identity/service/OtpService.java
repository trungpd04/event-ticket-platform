package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.common.exception.BusinessException;
import com.trungpd.eventticketplatform.identity.entity.Otp;
import com.trungpd.eventticketplatform.identity.entity.OtpType;
import com.trungpd.eventticketplatform.identity.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;

    @Transactional
    public String generateOtp(String email, OtpType type) {
        String code = String.format("%06d", new Random().nextInt(999999));

        Otp otp = new Otp();
        otp.setEmail(email);
        otp.setCode(code);
        otp.setType(type);
        otp.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        otp.setUsed(false);

        otpRepository.save(otp);
        return code;
    }

    @Transactional(readOnly = true)
    public Otp validateOtp(String email, String code, OtpType type) {
        Otp otp = otpRepository.findTopByEmailAndCodeAndTypeOrderByCreatedAtDesc(email, code, type)
                .orElseThrow(() -> new BusinessException("error.otp.invalid"));

        if (otp.isUsed()) {
            throw new BusinessException("error.otp.used");
        }

        if (otp.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("error.otp.expired");
        }

        return otp;
    }

    @Transactional
    public void markOtpAsUsed(Otp otp) {
        otp.setUsed(true);
        otpRepository.save(otp);
    }

}
