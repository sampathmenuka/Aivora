package com.sampath.digitalstore_backend.repository;

import com.sampath.digitalstore_backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByOrderNumberAndUserId(String orderNumber, Long userId);

    Optional<Order> findByPaymentIntentId(String paymentIntentId);

    @Query("""
        SELECT COUNT(oi) > 0
        FROM Order o
        JOIN o.orderItems oi
        WHERE o.user.id = :userId
          AND oi.product.id = :productId
          AND o.status = com.sampath.digitalstore_backend.entity.OrderStatus.PAID
    """)
    boolean hasPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
