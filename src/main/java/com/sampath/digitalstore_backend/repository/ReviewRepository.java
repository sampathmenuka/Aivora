package com.sampath.digitalstore_backend.repository;

import com.sampath.digitalstore_backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    @Query("select avg(r.rating) from Review r where r.product.id = :productId")
    Double getAverageRating(Long productId);

    @Query("select count(r) from Review r where r.product.id = :productId")
    Long getReviewCount(Long productId);
}
