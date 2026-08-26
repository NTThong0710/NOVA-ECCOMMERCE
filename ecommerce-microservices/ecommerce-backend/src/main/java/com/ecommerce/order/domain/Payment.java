package com.ecommerce.order.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // VNPAY, MOMO, COD

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, SUCCESS, FAILED

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
