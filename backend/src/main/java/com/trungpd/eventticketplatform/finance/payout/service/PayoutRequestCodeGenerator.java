package com.trungpd.eventticketplatform.finance.payout.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class PayoutRequestCodeGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    public String next() {
        String date = LocalDateTime.now().format(DATE_FORMAT);
        int sequence = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "PO-" + date + "-" + sequence;
    }

}
