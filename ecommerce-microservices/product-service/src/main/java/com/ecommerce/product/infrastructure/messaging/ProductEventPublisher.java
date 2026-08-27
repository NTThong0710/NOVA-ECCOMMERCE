package com.ecommerce.product.infrastructure.messaging;

import com.ecommerce.product.event.ProductCreatedEvent;
import org.springframework.stereotype.Service;

/**
 * ProductEventPublisher - stub version (messaging disabled for Render free tier).
 * Events are logged only, no RabbitMQ connection required.
 */
@Service
public class ProductEventPublisher {

    public void publishProductCreatedEvent(Long productId, String sku) {
        // Messaging disabled - just log event
        System.out.println("[EVENT] ProductCreated: id=" + productId + ", sku=" + sku);
    }
}
