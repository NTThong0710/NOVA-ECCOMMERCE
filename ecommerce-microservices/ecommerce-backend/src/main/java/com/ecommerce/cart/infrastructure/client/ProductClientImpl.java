package com.ecommerce.cart.infrastructure.client;

import com.ecommerce.product.infrastructure.repository.ProductRepository;
import com.ecommerce.product.domain.Product;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * ProductClientImpl - implementation cho monolith.
 * Gọi trực tiếp ProductRepository thay vì HTTP FeignClient.
 */
@Component
@Primary
public class ProductClientImpl implements ProductClient {

    private final ProductRepository productRepository;

    public ProductClientImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(p -> {
                    ProductDto dto = new ProductDto();
                    dto.setId(p.getId());
                    dto.setTitle(p.getTitle());
                    dto.setPrice(p.getPrice());
                    dto.setSku(p.getSku());
                    dto.setStockQuantity(p.getStockQuantity());
                    return dto;
                })
                .orElseGet(() -> {
                    ProductDto fallback = new ProductDto();
                    fallback.setId(id);
                    fallback.setTitle("Sản phẩm không tồn tại");
                    fallback.setPrice(0.0);
                    return fallback;
                });
    }
}
