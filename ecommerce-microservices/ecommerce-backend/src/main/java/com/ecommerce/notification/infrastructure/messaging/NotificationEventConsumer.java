package com.ecommerce.notification.infrastructure.messaging;

import com.ecommerce.notification.application.service.EmailService;
import com.ecommerce.notification.domain.Notification;
import com.ecommerce.notification.event.OrderCreatedEvent;
import com.ecommerce.notification.event.InventoryReservedEvent;
import com.ecommerce.notification.event.InventoryFailedEvent;
import com.ecommerce.notification.infrastructure.repository.NotificationRepository;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationEventConsumer {
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationEventConsumer(NotificationRepository notificationRepository, EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "notification.order.created.queue", durable = "true"),
            exchange = @Exchange(value = "ecommerce.exchange", type = "topic"),
            key = "order.created"
    ))
    public void handleOrderCreated(OrderCreatedEvent event) {
        System.out.println("Received OrderCreatedEvent in Notification Service for user email: " + event.getUserEmail());
        
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setUserEmail(event.getUserEmail());
        notification.setOrderId(event.getOrderId());
        notification.setType("ORDER_CREATED");
        notification.setStatus("SENT");
        notification.setTitle("Đơn hàng #" + event.getOrderId() + " đã được tạo");
        notification.setContent("Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.");
        notification.setSentAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
        System.out.println("Order created notification log saved to DB.");
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "notification.inventory.reserved.queue", durable = "true"),
            exchange = @Exchange(value = "ecommerce.exchange", type = "topic"),
            key = "inventory.reserved"
    ))
    public void handleInventoryReserved(InventoryReservedEvent event) {
        System.out.println("Received InventoryReservedEvent: " + event.getOrderId());
        
        // Gửi email
        emailService.sendOrderConfirmation(event.getUserEmail(), event.getOrderId(), event.getTotalAmount(), event.getShippingAddress());

        // Lưu thông báo
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setUserEmail(event.getUserEmail());
        notification.setOrderId(event.getOrderId());
        notification.setType("ORDER_CONFIRMED");
        notification.setStatus("SENT");
        notification.setTitle("Xác nhận đơn hàng #" + event.getOrderId());
        notification.setContent("Đơn hàng của bạn đã được xác nhận và đang chuẩn bị giao.");
        notification.setSentAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "notification.inventory.failed.queue", durable = "true"),
            exchange = @Exchange(value = "ecommerce.exchange", type = "topic"),
            key = "inventory.failed"
    ))
    public void handleInventoryFailed(InventoryFailedEvent event) {
        System.out.println("Received InventoryFailedEvent: " + event.getOrderId());
        
        // Gửi email
        emailService.sendOrderCancellation(event.getUserEmail(), event.getOrderId(), event.getReason());

        // Lưu thông báo
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setUserEmail(event.getUserEmail());
        notification.setOrderId(event.getOrderId());
        notification.setType("ORDER_CANCELLED");
        notification.setStatus("SENT");
        notification.setTitle("Đơn hàng #" + event.getOrderId() + " đã bị hủy");
        notification.setContent("Lý do: " + event.getReason());
        notification.setSentAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
}
