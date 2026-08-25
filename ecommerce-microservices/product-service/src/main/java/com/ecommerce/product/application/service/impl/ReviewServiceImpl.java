package com.ecommerce.product.application.service.impl;

import com.ecommerce.product.application.service.ReviewService;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.Rating;
import com.ecommerce.product.domain.Review;
import com.ecommerce.product.infrastructure.repository.ProductRepository;
import com.ecommerce.product.infrastructure.repository.ReviewRepository;
import com.ecommerce.product.presentation.dto.ReviewRequest;
import com.ecommerce.product.presentation.dto.ReviewResponse;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    @Override
    @CacheEvict(value = "product", key = "#productId")
    public ReviewResponse addReview(Long productId, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = new Review();
        review.setProduct(product);
        review.setUserId(request.getUserId() != null ? request.getUserId() : 1L);
        review.setUsername(request.getUsername() != null && !request.getUsername().trim().isEmpty() ? request.getUsername() : "Customer");
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);

        // Update product rating
        Rating rating = product.getRating();
        if (rating == null) {
            rating = new Rating(0.0, 0);
        }

        double totalScore = (rating.getRate() * rating.getCount()) + request.getRating();
        int newCount = rating.getCount() + 1;
        double newAverage = totalScore / newCount;

        rating.setRate(Math.round(newAverage * 10.0) / 10.0);
        rating.setCount(newCount);
        product.setRating(rating);
        productRepository.save(product);

        return mapToResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable) {
        return reviewRepository.findByProductId(productId, pageable)
                .map(this::mapToResponse);
    }

    private ReviewResponse mapToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUserId(review.getUserId());
        response.setUsername(review.getUsername() != null ? review.getUsername() : "Customer");
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }

}
