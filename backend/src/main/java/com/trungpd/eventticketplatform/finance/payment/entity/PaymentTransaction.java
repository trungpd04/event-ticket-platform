package com.trungpd.eventticketplatform.finance.payment.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import com.trungpd.eventticketplatform.finance.payment.PaymentProviderType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
public class PaymentTransaction extends BaseEntity {

    @Column(name = "external_transaction_id", nullable = false, length = 100)
    private String externalTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 50)
    private PaymentProviderType provider;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "raw_payload", nullable = false, columnDefinition = "TEXT")
    private String rawPayload;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "payment_code", length = 50)
    private String paymentCode;

    public PaymentTransaction(String externalTransactionId,
                              PaymentProviderType provider,
                              Long amount,
                              String status,
                              String rawPayload) {
        this.externalTransactionId = externalTransactionId;
        this.provider = provider;
        this.amount = amount;
        this.status = status;
        this.rawPayload = rawPayload;
    }
}
