package com.ecommerce.cart.infrastructure.client;

/**
 * ProductClient - interface (không còn dùng FeignClient trong monolith).
 * Implementation sẽ gọi trực tiếp ProductRepository.
 */
public interface ProductClient {
    ProductDto getProductById(Long id);
}
