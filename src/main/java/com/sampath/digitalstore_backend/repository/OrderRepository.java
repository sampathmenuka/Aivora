package com.sampath.digitalstore_backend.repository;

import com.sampath.digitalstore_backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    Order findByOrderNumber(String orderNumber);

    @Query("""
        SELECT COUNT(oi) > 0
        FROM Order o
        JOIN o.orderItems oi
        WHERE o.user.id = :userId
          AND oi.product.id = :productId
          AND o.status = 'PAID'
    """)
    boolean hasPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}