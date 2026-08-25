package com.ecommerce.promotion.service;

import com.ecommerce.promotion.domain.Coupon;
import com.ecommerce.promotion.dto.CreateCouponRequest;
import com.ecommerce.promotion.dto.ValidateCouponResult;

import java.util.List;

public interface CouponService {
    ValidateCouponResult validateCoupon(String code, String userEmail, Double orderAmount);
    Coupon applyCoupon(String code, String userEmail);
    List<Coupon> getAllCoupons();
    Coupon createCoupon(CreateCouponRequest req);
    Coupon updateCoupon(Long id, CreateCouponRequest req);
    void deleteCoupon(Long id);
    Coupon toggleActive(Long id);
}
