package com.ecommerce.product.infrastructure.messaging;

import com.ecommerce.product.event.ProductCreatedEvent;
import com.ecommerce.product.infrastructure.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProductEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public ProductEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishProductCreatedEvent(Long productId, String sku) {
        ProductCreatedEvent event = new ProductCreatedEvent(productId, sku);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "product.created", event);
        System.out.println("Published ProductCreatedEvent for SKU: " + sku);
    }
}
