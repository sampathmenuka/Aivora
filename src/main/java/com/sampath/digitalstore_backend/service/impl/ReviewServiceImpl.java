package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.review.ReviewRequest;
import com.sampath.digitalstore_backend.dto.review.ReviewResponse;
import com.sampath.digitalstore_backend.entity.Product;
import com.sampath.digitalstore_backend.entity.Review;
import com.sampath.digitalstore_backend.entity.User;
import com.sampath.digitalstore_backend.exception.BadRequestException;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.exception.UnauthorizedException;
import com.sampath.digitalstore_backend.repository.OrderRepository;
import com.sampath.digitalstore_backend.repository.ProductRepository;
import com.sampath.digitalstore_backend.repository.ReviewRepository;
import com.sampath.digitalstore_backend.repository.UserRepository;
import com.sampath.digitalstore_backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional
    @Override
    public ReviewResponse addOrUpdateReview(Long productId, ReviewRequest request, String email) {

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // ✅ Only buyers (PAID) can review
        boolean purchased = orderRepository.hasPurchasedProduct(user.getId(), productId);
        if (!purchased) {
            throw new UnauthorizedException("You can review only after purchase");
        }

        Review review = reviewRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElse(Review.builder()
                        .user(user)
                        .product(product)
                        .build());

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);

        return ReviewResponse.builder()
                .id(saved.getId())
                .rating(saved.getRating())
                .comment(saved.getComment())
                .userEmail(user.getEmail())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public List<ReviewResponse> getProductReviews(Long productId) {

        // validate product exists
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }

        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(r -> ReviewResponse.builder()
                        .id(r.getId())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .userEmail(r.getUser().getEmail())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    @Override
    public void deleteMyReview(Long productId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Review review = reviewRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        reviewRepository.delete(review);
    }
}