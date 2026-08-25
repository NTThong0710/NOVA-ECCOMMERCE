package com.ecommerce.product.presentation.controller;

import com.ecommerce.product.application.service.ReviewService;
import com.ecommerce.product.presentation.dto.ReviewRequest;
import com.ecommerce.product.presentation.dto.ReviewResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.addReview(productId, request);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    @GetMapping
    public Page<ReviewResponse> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        return reviewService.getReviewsByProduct(productId, pageable);
    }
}
