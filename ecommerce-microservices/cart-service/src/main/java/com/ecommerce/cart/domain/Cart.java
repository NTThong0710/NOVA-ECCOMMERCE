package com.ecommerce.cart.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "carts")
@Data
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ 1-1: Mỗi giỏ hàng thuộc về ĐÚNG 1 Người dùng duy nhất (dựa theo username/email)
    @Column(name = "user_email", nullable = false, unique = true)
    private String userEmail;

    // Mã giảm giá đang áp dụng (Nếu có)
    @Column(name = "discount_code")
    private String discountCode;

    // Tổng số tiền của giỏ hàng
    @Column(name = "total_amount")
    private Double totalAmount = 0.0;

    // Quan hệ 1-Nhiều: Một giỏ hàng chứa rất nhiều món đồ bên trong.
    // cascade = ALL: Nếu Giỏ hàng bị huỷ, toàn bộ Món hàng bên trong tự động bốc hơi theo.
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
