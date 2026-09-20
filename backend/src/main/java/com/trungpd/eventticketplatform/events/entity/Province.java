package com.trungpd.eventticketplatform.events.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "provinces")
@Getter
@Setter
@NoArgsConstructor
public class Province extends BaseEntity {

    @Column(name = "province_code", nullable = false, unique = true, length = 2)
    private String provinceCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "short_name")
    private String shortName;

    @Column(name = "code", length = 10)
    private String code;

    @Column(name = "place_type")
    private String placeType;

    @Column(name = "country", length = 10)
    private String country;

}
