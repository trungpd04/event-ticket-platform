package com.trungpd.eventticketplatform.finance.payment.repository;

import com.trungpd.eventticketplatform.finance.payment.PaymentProviderType;
import com.trungpd.eventticketplatform.finance.payment.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByExternalTransactionIdAndProvider(String externalTransactionId,
                                                                        PaymentProviderType provider);

    boolean existsByExternalTransactionIdAndProvider(String externalTransactionId, PaymentProviderType provider);
}
