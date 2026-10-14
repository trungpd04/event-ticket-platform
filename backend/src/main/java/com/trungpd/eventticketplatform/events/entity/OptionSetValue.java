package com.trungpd.eventticketplatform.events.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "option_set_values")
@Getter
@Setter
@NoArgsConstructor
public class OptionSetValue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_set_id", nullable = false)
    private OptionSet optionSet;

    @Column(name = "code", nullable = false, length = 100)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "value", length = 500)
    private String value;

    @Column(name = "color", length = 20)
    private String color;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

}
