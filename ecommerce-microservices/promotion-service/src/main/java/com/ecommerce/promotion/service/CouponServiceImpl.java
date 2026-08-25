package com.ecommerce.promotion.service;

import com.ecommerce.promotion.domain.Coupon;
import com.ecommerce.promotion.domain.UserCoupon;
import com.ecommerce.promotion.dto.CreateCouponRequest;
import com.ecommerce.promotion.dto.ValidateCouponResult;
import com.ecommerce.promotion.repository.CouponRepository;
import com.ecommerce.promotion.repository.UserCouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;

    @Override
    public ValidateCouponResult validateCoupon(String code, String userEmail, Double orderAmount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code).orElse(null);

        if (coupon == null) {
            return ValidateCouponResult.builder().valid(false).message("Mã giảm giá không tồn tại").build();
        }

        if (!coupon.getIsActive()) {
            return ValidateCouponResult.builder().valid(false).message("Mã giảm giá không còn hoạt động").build();
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && coupon.getStartDate().isAfter(now)) {
            return ValidateCouponResult.builder().valid(false).message("Mã chưa có hiệu lực").build();
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(now)) {
            return ValidateCouponResult.builder().valid(false).message("Mã đã hết hạn").build();
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return ValidateCouponResult.builder().valid(false).message("Mã đã hết lượt sử dụng").build();
        }

        if (coupon.getMinOrderAmount() != null && orderAmount < coupon.getMinOrderAmount()) {
            return ValidateCouponResult.builder().valid(false).message("Đơn hàng chưa đạt giá trị tối thiểu").build();
        }

        if (userEmail != null && userCouponRepository.existsByCouponIdAndUserEmail(coupon.getId(), userEmail)) {
            return ValidateCouponResult.builder().valid(false).message("Bạn đã sử dụng mã này rồi").build();
        }

        Double discountAmount = 0.0;
        if (coupon.getType() == Coupon.CouponType.PERCENTAGE) {
            discountAmount = orderAmount * (coupon.getValue() / 100.0);
            if (coupon.getMaxDiscountAmount() != null && discountAmount > coupon.getMaxDiscountAmount()) {
                discountAmount = coupon.getMaxDiscountAmount();
            }
        } else if (coupon.getType() == Coupon.CouponType.FIXED) {
            discountAmount = coupon.getValue();
            if (discountAmount > orderAmount) {
                discountAmount = orderAmount;
            }
        }

        return ValidateCouponResult.builder()
                .valid(true)
                .message("Áp dụng mã giảm giá thành công")
                .discountAmount(discountAmount)
                .finalAmount(orderAmount - discountAmount)
                .coupon(coupon)
                .build();
    }

    @Override
    @Transactional
    public Coupon applyCoupon(String code, String userEmail) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        if (userCouponRepository.existsByCouponIdAndUserEmail(coupon.getId(), userEmail)) {
            throw new RuntimeException("Bạn đã sử dụng mã này rồi");
        }

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        UserCoupon userCoupon = new UserCoupon();
        userCoupon.setCouponId(coupon.getId());
        userCoupon.setUserEmail(userEmail);
        userCouponRepository.save(userCoupon);

        return coupon;
    }

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    @Transactional
    public Coupon createCoupon(CreateCouponRequest req) {
        Coupon coupon = new Coupon();
        coupon.setCode(req.getCode().toUpperCase());
        coupon.setType(req.getType());
        coupon.setValue(req.getValue());
        coupon.setMinOrderAmount(req.getMinOrderAmount());
        coupon.setMaxDiscountAmount(req.getMaxDiscountAmount());
        coupon.setUsageLimit(req.getUsageLimit());
        coupon.setStartDate(req.getStartDate());
        coupon.setExpiryDate(req.getExpiryDate());
        coupon.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);
        coupon.setDescription(req.getDescription());
        
        return couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public Coupon updateCoupon(Long id, CreateCouponRequest req) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        coupon.setCode(req.getCode().toUpperCase());
        coupon.setType(req.getType());
        coupon.setValue(req.getValue());
        coupon.setMinOrderAmount(req.getMinOrderAmount());
        coupon.setMaxDiscountAmount(req.getMaxDiscountAmount());
        coupon.setUsageLimit(req.getUsageLimit());
        coupon.setStartDate(req.getStartDate());
        coupon.setExpiryDate(req.getExpiryDate());
        coupon.setIsActive(req.getIsActive() != null ? req.getIsActive() : coupon.getIsActive());
        coupon.setDescription(req.getDescription());

        return couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
        couponRepository.delete(coupon);
    }

    @Override
    @Transactional
    public Coupon toggleActive(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
        coupon.setIsActive(!coupon.getIsActive());
        return couponRepository.save(coupon);
    }
}
