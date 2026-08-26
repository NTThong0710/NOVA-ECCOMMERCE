package com.ecommerce.product.application.service;

import com.ecommerce.product.presentation.dto.ReviewRequest;
import com.ecommerce.product.presentation.dto.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse addReview(Long productId, ReviewRequest request);
    Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable);
}
