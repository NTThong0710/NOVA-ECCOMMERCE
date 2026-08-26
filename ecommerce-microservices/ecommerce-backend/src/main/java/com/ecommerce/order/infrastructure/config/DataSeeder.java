package com.ecommerce.order.infrastructure.config;

import com.ecommerce.order.domain.Order;
import com.ecommerce.order.domain.OrderItem;
import com.ecommerce.order.domain.Payment;
import com.ecommerce.order.infrastructure.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final OrderRepository orderRepository;

    @Override
    public void run(String... args) {
        if (orderRepository.count() > 0) {
            log.info("Order data already exists. Skipping seeder.");
            return;
        }

        log.info("Seeding sample orders...");

        // Order 1: Delivered
        createOrder(1L, "customer@ecommerce.com", "Nguyễn Văn Khách", "0987654321", 
            "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", "DELIVERED", 1199.0, 1L, 1, 1199.0, "VNPAY", "SUCCESS");

        // Order 2: Shipped
        createOrder(1L, "customer@ecommerce.com", "Nguyễn Văn Khách", "0987654321", 
            "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", "SHIPPED", 899.0, 2L, 1, 899.0, "COD", "PENDING");

        // Order 3: Paid
        createOrder(2L, "thongnguyen07102004@gmail.com", "Thông Nguyễn Admin", "0917374532", 
            "456 Lê Duẩn, Ba Đình, Hà Nội", "PAID", 2499.0, 3L, 1, 2499.0, "VNPAY", "SUCCESS");

        // Order 4: Confirmed
        createOrder(2L, "thongnguyen07102004@gmail.com", "Thông Nguyễn Admin", "0917374532", 
            "456 Lê Duẩn, Ba Đình, Hà Nội", "CONFIRMED", 199.0, 4L, 2, 99.5, "COD", "PENDING");

        // Order 5: Pending
        createOrder(1L, "customer@ecommerce.com", "Nguyễn Văn Khách", "0987654321", 
            "789 Điện Biên Phủ, Đà Nẵng", "PENDING", 450.0, 5L, 3, 150.0, "COD", "PENDING");

        log.info("Successfully seeded 5 sample orders!");
    }

    private void createOrder(Long userId, String email, String fullName, String phone, 
                             String address, String status, Double total, Long productId, 
                             int quantity, double price, String payMethod, String payStatus) {
        Order order = new Order();
        order.setUserId(userId);
        order.setUserEmail(email);
        order.setFullName(fullName);
        order.setPhone(phone);
        order.setShippingAddress(address);
        order.setStatus(status);
        order.setTotalAmount(total);

        List<OrderItem> items = new ArrayList<>();
        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProductId(productId);
        item.setQuantity(quantity);
        item.setPrice(price);
        items.add(item);
        order.setItems(items);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(payMethod);
        payment.setStatus(payStatus);
        payment.setAmount(total);
        payment.setTransactionId("TRANS_" + System.currentTimeMillis() + "_" + productId);
        order.setPayment(payment);

        orderRepository.save(order);
    }
}