package com.ecommerce.cart.domain;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cart_items")
@Data
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nhiều CartItem thuộc về 1 Cart
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonIgnore // Tránh lỗi lặp vô hạn (Infinite Recursion) khi parse ra JSON
    private Cart cart;

    // Không Map cứng @ManyToOne sang Product entity nữa (chuẩn Microservice)
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "price_at_addition")
    private Double priceAtAddition = 0.0;
}
