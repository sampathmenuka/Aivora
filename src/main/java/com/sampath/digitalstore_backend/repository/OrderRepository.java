package com.sampath.digitalstore_backend.repository;

import com.sampath.digitalstore_backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    Order findByOrderNumber(String orderNumber);
}