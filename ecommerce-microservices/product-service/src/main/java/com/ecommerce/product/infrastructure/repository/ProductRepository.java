package com.ecommerce.product.infrastructure.repository;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySku(String sku);
    
    boolean existsBySku(String sku);

    Page<Product> findByTitleContainingIgnoreCaseAndCategoryContainingIgnoreCaseAndStatus(String title, String category, ProductStatus status, Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL")
    List<String> findDistinctCategories();
}
