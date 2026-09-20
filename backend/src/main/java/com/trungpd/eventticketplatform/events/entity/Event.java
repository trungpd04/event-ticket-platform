package com.trungpd.eventticketplatform.events.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
public class Event extends BaseEntity {

    @Column(name = "organizer_id", nullable = false)
    private Long organizerId;

    @Column(name = "fee_policy_id", nullable = false)
    private Long feePolicyId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "province_id")
    private Long provinceId;

    @Column(name = "ticket_sale_start_time")
    private Instant ticketSaleStartTime;

    @Column(name = "ticket_sale_end_time")
    private Instant ticketSaleEndTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EventStatus status;

}
