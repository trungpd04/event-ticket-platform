package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OptionSetValueRepository extends JpaRepository<OptionSetValue, Long> {

    List<OptionSetValue> findAllByOptionSetCodeAndStatusOrderBySortOrderAsc(String optionSetCode, String status);

    List<OptionSetValue> findAllByOptionSetCodeOrderBySortOrderAsc(String optionSetCode);

    Optional<OptionSetValue> findByOptionSetCodeAndCode(String optionSetCode, String code);

    boolean existsByOptionSetCodeAndCode(String optionSetCode, String code);

}
