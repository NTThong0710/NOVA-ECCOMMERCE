package com.ecommerce.order.infrastructure.messaging;

import com.ecommerce.order.domain.Order;
import com.ecommerce.order.event.InventoryFailedEvent;
import com.ecommerce.order.event.InventoryReservedEvent;
import com.ecommerce.order.infrastructure.repository.OrderRepository;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrderEventConsumer {
    private final OrderRepository orderRepository;

    public OrderEventConsumer(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "order.inventory.reserved.queue", durable = "true"),
            exchange = @Exchange(value = "ecommerce.exchange", type = "topic"),
            key = "inventory.reserved"
    ))
    public void handleInventoryReserved(InventoryReservedEvent event) {
        System.out.println("Received InventoryReservedEvent for order: " + event.getOrderId());
        Optional<Order> orderOpt = orderRepository.findById(event.getOrderId());
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus("CONFIRMED"); // OR PAID
            orderRepository.save(order);
            System.out.println("Order status updated to CONFIRMED");
            // Could publish OrderConfirmedEvent here for NotificationService
        }
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "order.inventory.failed.queue", durable = "true"),
            exchange = @Exchange(value = "ecommerce.exchange", type = "topic"),
            key = "inventory.failed"
    ))
    public void handleInventoryFailed(InventoryFailedEvent event) {
        System.out.println("Received InventoryFailedEvent for order: " + event.getOrderId());
        Optional<Order> orderOpt = orderRepository.findById(event.getOrderId());
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus("CANCELLED");
            orderRepository.save(order);
            System.out.println("Order status updated to CANCELLED due to inventory shortage");
        }
    }
}
