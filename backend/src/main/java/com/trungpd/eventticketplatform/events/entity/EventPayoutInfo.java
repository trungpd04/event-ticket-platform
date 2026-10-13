package com.trungpd.eventticketplatform.events.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "event_payout_infos")
@Getter
@Setter
@NoArgsConstructor
public class EventPayoutInfo extends BaseEntity {

    @Column(name = "event_id", nullable = false, unique = true)
    private Long eventId;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "account_holder")
    private String accountHolder;

    @Column(name = "branch")
    private String branch;

}
