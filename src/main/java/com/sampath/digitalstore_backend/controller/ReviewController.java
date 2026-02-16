package com.sampath.digitalstore_backend.controller;

import com.sampath.digitalstore_backend.dto.review.ReviewRequest;
import com.sampath.digitalstore_backend.dto.review.ReviewResponse;
import com.sampath.digitalstore_backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 🔓 public: view reviews
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    // 🔐 buyer: add/update review
    @PostMapping
    public ResponseEntity<ReviewResponse> addOrUpdate(
            @PathVariable Long productId,
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                reviewService.addOrUpdateReview(productId, request, userDetails.getUsername())
        );
    }

    // 🔐 buyer: delete own review
    @DeleteMapping
    public ResponseEntity<String> deleteMy(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        reviewService.deleteMyReview(productId, userDetails.getUsername());
        return ResponseEntity.ok("Review deleted");
    }
}