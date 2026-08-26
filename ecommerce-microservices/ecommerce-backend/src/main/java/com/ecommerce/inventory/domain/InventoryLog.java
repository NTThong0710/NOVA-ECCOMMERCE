package com.ecommerce.inventory.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_logs")
@Data
public class InventoryLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    @Column(name = "quantity_changed", nullable = false)
    private Integer quantityChanged;

    @Column(nullable = false)
    private String type; // RESTOCK, SOLD, RESERVED, CANCELLED

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
