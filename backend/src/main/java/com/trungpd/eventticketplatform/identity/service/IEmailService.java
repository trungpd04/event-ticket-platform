package com.trungpd.eventticketplatform.identity.service;

public interface IEmailService {

    void sendOtpEmail(String to, String code, String type);

    void sendTicketEmail(String to, String subject, String content);
}
