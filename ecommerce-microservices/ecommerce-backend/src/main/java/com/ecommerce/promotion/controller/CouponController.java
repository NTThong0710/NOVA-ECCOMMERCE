package com.ecommerce.promotion.controller;

import com.ecommerce.promotion.domain.Coupon;
import com.ecommerce.promotion.domain.UserCoupon;
import com.ecommerce.promotion.dto.ApplyCouponRequest;
import com.ecommerce.promotion.dto.CreateCouponRequest;
import com.ecommerce.promotion.dto.ValidateCouponRequest;
import com.ecommerce.promotion.dto.ValidateCouponResult;
import com.ecommerce.promotion.service.CouponService;
import com.ecommerce.promotion.repository.UserCouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final UserCouponRepository userCouponRepository;

    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody ValidateCouponRequest request) {
        ValidateCouponResult result = couponService.validateCoupon(
                request.getCode(), request.getUserEmail(), request.getOrderAmount());
        if (!result.isValid()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "INVALID_COUPON",
                    "message", result.getMessage()
            ));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyCoupon(@RequestBody ApplyCouponRequest request,
                                         @RequestHeader(value = "X-Auth-User", required = false) String authUser) {
        if (authUser == null || authUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "UNAUTHORIZED",
                    "message", "User must be logged in to apply coupon"
            ));
        }
        
        try {
            Coupon coupon = couponService.applyCoupon(request.getCode(), request.getUserEmail());
            return ResponseEntity.ok(coupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "APPLY_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/coupons")
    public ResponseEntity<?> getAllCoupons(@RequestHeader(value = "X-Auth-Roles", required = false) String roles) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "FORBIDDEN",
                    "message", "Admin access required"
            ));
        }
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody CreateCouponRequest request,
                                          @RequestHeader(value = "X-Auth-Roles", required = false) String roles) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "FORBIDDEN",
                    "message", "Admin access required"
            ));
        }
        return ResponseEntity.ok(couponService.createCoupon(request));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody CreateCouponRequest request,
                                          @RequestHeader(value = "X-Auth-Roles", required = false) String roles) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "FORBIDDEN",
                    "message", "Admin access required"
            ));
        }
        try {
            return ResponseEntity.ok(couponService.updateCoupon(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "UPDATE_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id,
                                          @RequestHeader(value = "X-Auth-Roles", required = false) String roles) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "FORBIDDEN",
                    "message", "Admin access required"
            ));
        }
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "DELETE_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    @PatchMapping("/coupons/{id}/toggle")
    public ResponseEntity<?> toggleActive(@PathVariable Long id,
                                          @RequestHeader(value = "X-Auth-Roles", required = false) String roles) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "FORBIDDEN",
                    "message", "Admin access required"
            ));
        }
        try {
            return ResponseEntity.ok(couponService.toggleActive(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "TOGGLE_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/my-coupons")
    public ResponseEntity<?> getMyCoupons(@RequestHeader(value = "X-Auth-User", required = false) String authUser) {
        if (authUser == null || authUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "UNAUTHORIZED",
                    "message", "User must be logged in"
            ));
        }
        List<UserCoupon> myCoupons = userCouponRepository.findByUserEmail(authUser);
        return ResponseEntity.ok(myCoupons);
    }
}
