package com.ecommerce.product.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity // Biến Java Class này thành một Bảng (Table) trong Database Supabase
@Table(name = "products") // Đặt tên bảng là 'products'
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    
    @Id // Đánh dấu đây là Khóa chính (Primary Key)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Database tự động đếm tăng ID (1, 2, 3...)
    private Long id;

    private String title;
    @Column(unique = true)
    private String slug;

    @Column(unique = true)
    private String sku;

    private Double price;

    @Column(name = "discount_price")
    private Double discountPrice;

    @Column(name = "discount_start_date")
    private LocalDateTime discountStartDate;

    @Column(name = "discount_end_date")
    private LocalDateTime discountEndDate;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(columnDefinition = "TEXT") 
    private String description;
    
    @Column(name = "meta_title")
    private String metaTitle;
    
    @Column(name = "meta_description")
    private String metaDescription;

    // Giữ lại category dạng chuỗi cho tương thích Frontend hiện tại, 
    // hoặc có thể mapping ManyToOne sang bảng Category (tạm giữ String)
    private String category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category categoryEntity;

    private String image;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    private String brand;

    private Double weight;

    private String dimensions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> attributes;

    @ElementCollection
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Embedded // Nhúng đối tượng Rating vào thẳng bảng này luôn (tạo ra 2 cột là rate và count)
    private Rating rating;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ProductStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
