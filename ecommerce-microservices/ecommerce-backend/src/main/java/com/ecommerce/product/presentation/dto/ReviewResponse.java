package com.ecommerce.product.presentation.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String username;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

}
