package com.ecommerce.promotion.dto;

import com.ecommerce.promotion.domain.Coupon;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ValidateCouponResult {
    private boolean valid;
    private String message;
    private Double discountAmount;
    private Double finalAmount;
    private Coupon coupon;
}
