package com.ecommerce.promotion.repository;

import com.ecommerce.promotion.domain.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
    boolean existsByCouponIdAndUserEmail(Long couponId, String userEmail);
    List<UserCoupon> findByUserEmail(String userEmail);
}
