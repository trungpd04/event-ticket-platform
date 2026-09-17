package com.trungpd.eventticketplatform.events.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "fee_policies")
@Getter
@Setter
@NoArgsConstructor
public class FeePolicy extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "organizer_commission_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal organizerCommissionRate;

    @Column(name = "customer_fee_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal customerFeeRate;

    @Column(name = "customer_flat_fee", nullable = false)
    private Long customerFlatFee;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

}
