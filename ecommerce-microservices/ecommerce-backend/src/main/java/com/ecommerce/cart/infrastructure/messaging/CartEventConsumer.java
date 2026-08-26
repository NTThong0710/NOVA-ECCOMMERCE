package com.ecommerce.cart.infrastructure.messaging;

import com.ecommerce.cart.domain.Cart;
import com.ecommerce.cart.event.OrderCreatedEvent;
import com.ecommerce.cart.infrastructure.repository.CartRepository;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartEventConsumer {
    private final CartRepository cartRepository;

    public CartEventConsumer(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "cart.order.created.queue", durable = "true"),
            exchange = @Exchange(value = "ecommerce.exchange", type = "topic"),
            key = "order.created"
    ))
    public void handleOrderCreated(OrderCreatedEvent event) {
        System.out.println("Received OrderCreatedEvent in Cart Service for user: " + event.getUserEmail());
        Optional<Cart> cartOpt = cartRepository.findByUserEmail(event.getUserEmail());
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            // Xóa tất cả items trong giỏ hàng vì đã đặt hàng
            cart.getItems().clear();
            cart.setTotalAmount(0.0);
            cartRepository.save(cart);
            System.out.println("Cart cleared for user: " + event.getUserEmail());
        }
    }
}
