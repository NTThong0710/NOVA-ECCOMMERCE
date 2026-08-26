package com.ecommerce.inventory.infrastructure.messaging;

import com.ecommerce.inventory.domain.Inventory;
import com.ecommerce.inventory.event.ProductCreatedEvent;
import com.ecommerce.inventory.infrastructure.repository.InventoryRepository;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductEventConsumer {

    private final InventoryRepository inventoryRepository;

    public ProductEventConsumer(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "inventory.product.created.queue", durable = "true"),
            exchange = @Exchange(value = "ecommerce.exchange", type = "topic"),
            key = "product.created"
    ))
    @Transactional
    public void handleProductCreated(ProductCreatedEvent event) {
        System.out.println("Received ProductCreatedEvent for SKU: " + event.getSku());
        
        if (!inventoryRepository.findByProductId(event.getProductId()).isPresent()) {
            Inventory inventory = new Inventory();
            inventory.setProductId(event.getProductId());
            inventory.setTotalStock(0);
            inventory.setReservedStock(0);
            inventoryRepository.save(inventory);
            System.out.println("Initialized inventory for Product ID: " + event.getProductId());
        }
    }
}
