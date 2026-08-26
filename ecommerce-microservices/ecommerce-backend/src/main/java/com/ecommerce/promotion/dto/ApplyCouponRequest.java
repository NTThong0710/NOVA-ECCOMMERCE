package com.ecommerce.promotion.dto;

import lombok.Data;

@Data
public class ApplyCouponRequest {
    private String code;
    private String userEmail;
}
