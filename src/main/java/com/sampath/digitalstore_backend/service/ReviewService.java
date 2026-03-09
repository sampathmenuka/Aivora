package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.review.ReviewRequest;
import com.sampath.digitalstore_backend.dto.review.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse addOrUpdateReview(Long productId, ReviewRequest request, String email);

    List<ReviewResponse> getProductReviews(Long productId);

    void deleteMyReview(Long productId, String email);
}