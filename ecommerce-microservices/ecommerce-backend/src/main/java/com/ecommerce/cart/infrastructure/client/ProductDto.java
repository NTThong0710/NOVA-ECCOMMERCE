package com.ecommerce.cart.infrastructure.client;

import lombok.Data;

@Data
public class ProductDto {
    private Long id;
    private String title;
    private Double price;
    private Double discountPrice;
    private Integer stockQuantity;
}
