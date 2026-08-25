package com.ecommerce.promotion.seeder;

import com.ecommerce.promotion.domain.Coupon;
import com.ecommerce.promotion.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    public void run(String... args) throws Exception {
        if (couponRepository.count() == 0) {
            seedCoupons();
        }
    }

    private void seedCoupons() {
        // 1. WELCOME10
        Coupon c1 = new Coupon();
        c1.setCode("WELCOME10");
        c1.setType(Coupon.CouponType.PERCENTAGE);
        c1.setValue(10.0);
        c1.setMinOrderAmount(20.0);
        c1.setMaxDiscountAmount(50.0);
        c1.setDescription("10% off, min order $20, max discount $50");
        c1.setStartDate(LocalDateTime.now());
        couponRepository.save(c1);

        // 2. FLAT20
        Coupon c2 = new Coupon();
        c2.setCode("FLAT20");
        c2.setType(Coupon.CouponType.FIXED);
        c2.setValue(20.0);
        c2.setMinOrderAmount(50.0);
        c2.setDescription("$20 off, min order $50");
        c2.setStartDate(LocalDateTime.now());
        couponRepository.save(c2);

        // 3. SUMMER25
        Coupon c3 = new Coupon();
        c3.setCode("SUMMER25");
        c3.setType(Coupon.CouponType.PERCENTAGE);
        c3.setValue(25.0);
        c3.setMinOrderAmount(100.0);
        c3.setMaxDiscountAmount(200.0);
        c3.setDescription("25% off, min order $100, max discount $200");
        c3.setStartDate(LocalDateTime.now());
        couponRepository.save(c3);

        // 4. VIP50
        Coupon c4 = new Coupon();
        c4.setCode("VIP50");
        c4.setType(Coupon.CouponType.FIXED);
        c4.setValue(50.0);
        c4.setMinOrderAmount(200.0);
        c4.setDescription("$50 off, min order $200");
        c4.setStartDate(LocalDateTime.now());
        couponRepository.save(c4);

        // 5. NEWUSER
        Coupon c5 = new Coupon();
        c5.setCode("NEWUSER");
        c5.setType(Coupon.CouponType.PERCENTAGE);
        c5.setValue(15.0);
        c5.setMinOrderAmount(0.0);
        c5.setMaxDiscountAmount(30.0);
        c5.setDescription("15% off, no min order, max discount $30");
        c5.setStartDate(LocalDateTime.now());
        couponRepository.save(c5);
    }
}
