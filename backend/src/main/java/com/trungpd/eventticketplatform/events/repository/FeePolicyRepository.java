package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.FeePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeePolicyRepository extends JpaRepository<FeePolicy, Long> {

    List<FeePolicy> findAllByIsActiveTrue();

    Optional<FeePolicy> findByIdAndIsActiveTrue(Long id);

    Optional<FeePolicy> findByIsDefaultTrue();

    Optional<FeePolicy> findByIsDefaultTrueAndIsActiveTrue();

}
