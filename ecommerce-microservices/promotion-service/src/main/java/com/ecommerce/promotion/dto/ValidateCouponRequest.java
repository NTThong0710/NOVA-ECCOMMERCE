package com.ecommerce.promotion.dto;

import lombok.Data;

@Data
public class ValidateCouponRequest {
    private String code;
    private String userEmail;
    private Double orderAmount;
}
