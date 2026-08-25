package com.ecommerce.inventory.infrastructure.messaging;

import com.ecommerce.inventory.domain.Inventory;
import com.ecommerce.inventory.domain.InventoryLog;
import com.ecommerce.inventory.event.InventoryFailedEvent;
import com.ecommerce.inventory.event.InventoryReservedEvent;
import com.ecommerce.inventory.event.OrderCreatedEvent;
import com.ecommerce.inventory.infrastructure.config.RabbitMQConfig;
import com.ecommerce.inventory.infrastructure.repository.InventoryRepository;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class InventoryEventConsumer {
    private final InventoryRepository inventoryRepository;
    private final RabbitTemplate rabbitTemplate;

    public InventoryEventConsumer(InventoryRepository inventoryRepository, RabbitTemplate rabbitTemplate) {
        this.inventoryRepository = inventoryRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "inventory.order.created.queue", durable = "true"),
            exchange = @Exchange(value = "ecommerce.exchange", type = "topic"),
            key = "order.created"
    ))
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        System.out.println("Received OrderCreatedEvent in Inventory Service for order: " + event.getOrderId());
        
        boolean allInStock = true;
        
        // Very basic locking logic
        for (OrderCreatedEvent.OrderItemDto item : event.getItems()) {
            Optional<Inventory> invOpt = inventoryRepository.findByProductId(item.getProductId());
            if (invOpt.isEmpty() || invOpt.get().getAvailableStock() < item.getQuantity()) {
                allInStock = false;
                break;
            }
        }

        if (allInStock) {
            for (OrderCreatedEvent.OrderItemDto item : event.getItems()) {
                Inventory inv = inventoryRepository.findByProductId(item.getProductId()).get();
                inv.setReservedStock(inv.getReservedStock() + item.getQuantity());
                inventoryRepository.save(inv);
                // Can also save InventoryLog here
            }
            // Publish Success
            InventoryReservedEvent successEvent = new InventoryReservedEvent(event.getOrderId(), "SUCCESS");
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "inventory.reserved", successEvent);
            System.out.println("Stock reserved. Published InventoryReservedEvent.");
        } else {
            // Publish Fail
            InventoryFailedEvent failedEvent = new InventoryFailedEvent(event.getOrderId(), "OUT_OF_STOCK");
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "inventory.failed", failedEvent);
            System.out.println("Stock insufficient. Published InventoryFailedEvent.");
        }
    }
}
