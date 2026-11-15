package com.trungpd.eventticketplatform.identity.repository;

import com.trungpd.eventticketplatform.identity.entity.User;
import com.trungpd.eventticketplatform.identity.entity.Role;
import com.trungpd.eventticketplatform.identity.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u WHERE :role MEMBER OF u.roles AND u.status = :status")
    List<User> findByRoleAndStatus(@Param("role") Role role, @Param("status") UserStatus status);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles role WHERE role = :role")
    List<User> findAllByRole(@Param("role") Role role);

}
