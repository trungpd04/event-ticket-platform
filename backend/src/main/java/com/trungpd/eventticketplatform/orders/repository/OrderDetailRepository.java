package com.trungpd.eventticketplatform.orders.repository;

import com.trungpd.eventticketplatform.orders.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    List<OrderDetail> findByOrderId(Long orderId);

}
