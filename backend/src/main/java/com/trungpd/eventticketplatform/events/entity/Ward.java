package com.trungpd.eventticketplatform.events.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "wards")
@Getter
@Setter
@NoArgsConstructor
public class Ward extends BaseEntity {

    @Column(name = "ward_code", nullable = false, unique = true, length = 6)
    private String wardCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "province_id", nullable = false)
    private Long provinceId;

}
