package com.ecommerce.cart.presentation.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Integer productId;
    private int quantity;
}

