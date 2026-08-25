package com.ecommerce.cart.infrastructure.client;

import org.springframework.stereotype.Component;

@Component
public class ProductClientFallback implements ProductClient {
    
    @Override
    public ProductDto getProductById(Long id) {
        // Fallback method khi Product Service bị sập hoặc phản hồi quá chậm (Circuit Breaker OPEN).
        // Trả về một ProductDto tạm thời hoặc ném ra exception tùy nghiệp vụ.
        System.err.println("[CIRCUIT BREAKER] Product Service is down! Returning fallback product data for ID: " + id);
        ProductDto fallbackProduct = new ProductDto();
        fallbackProduct.setId(id);
        fallbackProduct.setTitle("Sản phẩm tạm thời không khả dụng");
        fallbackProduct.setPrice(0.0);
        return fallbackProduct;
    }
}
