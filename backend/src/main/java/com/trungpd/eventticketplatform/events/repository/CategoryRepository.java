package com.trungpd.eventticketplatform.events.repository;

import com.trungpd.eventticketplatform.events.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByIsActiveTrue();

    Optional<Category> findByIdAndIsActiveTrue(Long id);

}
