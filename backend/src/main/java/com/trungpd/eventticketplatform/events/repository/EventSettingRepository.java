package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.EventSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventSettingRepository extends JpaRepository<EventSetting, Long> {

}
