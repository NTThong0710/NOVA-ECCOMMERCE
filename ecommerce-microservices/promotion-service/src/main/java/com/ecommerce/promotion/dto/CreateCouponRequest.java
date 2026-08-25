package com.ecommerce.promotion.dto;

import com.ecommerce.promotion.domain.Coupon;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateCouponRequest {
    private String code;
    private Coupon.CouponType type;
    private Double value;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private Integer usageLimit;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private Boolean isActive;
    private String description;
}
