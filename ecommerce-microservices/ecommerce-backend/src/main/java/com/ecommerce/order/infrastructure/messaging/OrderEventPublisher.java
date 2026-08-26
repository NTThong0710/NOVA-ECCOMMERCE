package com.ecommerce.order.infrastructure.messaging;

import com.ecommerce.order.event.OrderCreatedEvent;
import com.ecommerce.order.infrastructure.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public OrderEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishOrderCreated(OrderCreatedEvent event) {
        System.out.println("Publishing OrderCreatedEvent for order: " + event.getOrderId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "order.created", event);
    }
}
