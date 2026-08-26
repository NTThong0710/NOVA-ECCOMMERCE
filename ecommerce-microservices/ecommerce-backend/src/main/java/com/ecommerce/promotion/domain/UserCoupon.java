package com.ecommerce.promotion.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_coupons")
@Data
public class UserCoupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "coupon_id", nullable = false)
    private Long couponId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "used_at")
    private LocalDateTime usedAt = LocalDateTime.now();
}
