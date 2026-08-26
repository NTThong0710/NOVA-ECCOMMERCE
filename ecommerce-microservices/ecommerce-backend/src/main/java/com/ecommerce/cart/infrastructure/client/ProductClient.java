package com.ecommerce.cart.infrastructure.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", path = "/products", fallback = ProductClientFallback.class)
public interface ProductClient {
    
    @GetMapping("/{id}")
    ProductDto getProductById(@PathVariable("id") Long id);
}
