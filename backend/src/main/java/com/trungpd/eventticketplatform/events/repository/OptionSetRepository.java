package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.OptionSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OptionSetRepository extends JpaRepository<OptionSet, Long> {

    Optional<OptionSet> findByCode(String code);

    boolean existsByCode(String code);

}
