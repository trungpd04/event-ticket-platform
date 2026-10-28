package com.trungpd.eventticketplatform.finance.payment.sepay;

import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class SePayQrCodeBuilder {

    public String build(String accountNumber, String bankCode, Long amount, String content) {
        return UriComponentsBuilder
                .fromUriString("https://vietqr.app/img")
                .queryParam("acc", accountNumber)
                .queryParam("bank", bankCode)
                .queryParam("amount", amount)
                .queryParam("des", content)
                .build()
                .toUriString();
    }
}
