package com.trungpd.eventticketplatform.identity.service;

import com.trungpd.eventticketplatform.identity.dto.response.GoogleUserInfo;

public interface IGoogleTokenVerifier {
    GoogleUserInfo verify(String idToken);
}
