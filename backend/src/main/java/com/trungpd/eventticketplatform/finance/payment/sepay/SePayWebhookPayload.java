package com.trungpd.eventticketplatform.finance.payment.sepay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class SePayWebhookPayload {

    private Long id;
    private String gateway;

    @JsonProperty("transactionDate")
    private String transactionDate;

    @JsonProperty("accountNumber")
    private String accountNumber;

    @JsonProperty("subAccount")
    private String subAccount;

    private String code;
    private String content;

    @JsonProperty("transferType")
    private String transferType;

    private String description;

    @JsonProperty("transferAmount")
    private Long transferAmount;

    @JsonProperty("accumulated")
    private Long accumulated;

    @JsonProperty("referenceCode")
    private String referenceCode;
}
