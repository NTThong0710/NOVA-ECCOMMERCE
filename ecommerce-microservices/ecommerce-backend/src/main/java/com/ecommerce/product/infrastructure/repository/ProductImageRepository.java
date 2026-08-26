package com.ecommerce.product.infrastructure.repository;

import com.ecommerce.product.domain.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
