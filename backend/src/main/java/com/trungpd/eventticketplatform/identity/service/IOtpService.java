package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.identity.entity.Otp;
import com.trungpd.eventticketplatform.identity.entity.OtpType;

public interface IOtpService {

    String generateOtp(String email, OtpType type);

    Otp validateOtp(String email, String code, OtpType type);

    void markOtpAsUsed(Otp otp);
}
