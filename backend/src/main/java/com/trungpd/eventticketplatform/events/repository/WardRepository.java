package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WardRepository extends JpaRepository<Ward, Long> {

    List<Ward> findByProvinceIdOrderByNameAsc(Long provinceId);

}
