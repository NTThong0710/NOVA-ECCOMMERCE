package com.ecommerce.inventory.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "inventories")
@Data
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", unique = true, nullable = false)
    private Long productId;

    @Column(name = "total_stock", nullable = false)
    private Integer totalStock = 0;

    @Column(name = "reserved_stock", nullable = false)
    private Integer reservedStock = 0;

    @Column(name = "available_stock", nullable = false)
    private Integer availableStock = 0;

    @PrePersist
    @PreUpdate
    protected void calculateAvailableStock() {
        if (totalStock != null && reservedStock != null) {
            this.availableStock = this.totalStock - this.reservedStock;
        }
    }
}
