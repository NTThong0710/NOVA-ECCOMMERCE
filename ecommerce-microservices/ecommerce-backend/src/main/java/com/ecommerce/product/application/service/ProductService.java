package com.ecommerce.product.application.service;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductImage;
import com.ecommerce.product.presentation.dto.ProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    Product createProduct(ProductRequest request);
    Product updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    Product getProductById(Long id);
    Page<Product> getProducts(String title, String category, Double minPrice, Double maxPrice, List<String> tags, List<String> brands, Pageable pageable);

    List<Product> getRelatedProducts(Long id);

    List<String> getCategories();

    List<ProductImage> uploadProductImage(Long id, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
    void deleteProductImage(Long id, Long imageId) throws java.io.IOException;
}
