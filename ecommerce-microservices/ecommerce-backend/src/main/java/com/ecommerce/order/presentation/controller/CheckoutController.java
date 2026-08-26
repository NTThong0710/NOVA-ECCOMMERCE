package com.ecommerce.order.presentation.controller;

import com.ecommerce.order.domain.Order;
import com.ecommerce.order.domain.OrderItem;
import com.ecommerce.order.domain.Payment;
import com.ecommerce.order.event.OrderCreatedEvent;
import com.ecommerce.order.infrastructure.messaging.OrderEventPublisher;
import com.ecommerce.order.infrastructure.payment.VNPayService;
import com.ecommerce.order.infrastructure.repository.OrderRepository;
import com.ecommerce.order.presentation.dto.CheckoutRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * CheckoutController - Xu ly tao don hang.
 *
 * Ho tro 2 phuong thuc thanh toan:
 * - COD  : Tao Order -> Chay Saga ngay (Inventory check -> Confirm)
 * - VNPAY: Tao Order (PENDING_PAYMENT) -> Tra ve URL VNPay -> User thanh toan
 *          -> VNPay callback -> PaymentController cap nhat trang thai
 */
@RestController
@RequestMapping("/api/orders")
public class CheckoutController {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;
    private final VNPayService vnPayService;

    public CheckoutController(OrderRepository orderRepository,
                               OrderEventPublisher eventPublisher,
                               VNPayService vnPayService) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
        this.vnPayService = vnPayService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request,
                                       HttpServletRequest httpRequest) {
        // 1. Tao Order voi trang thai phu hop vao phuong thuc thanh toan
        Order order = new Order();
        order.setUserId(request.getUserId() != null ? request.getUserId() : 0L);
        
        // Luu userEmail: neu request khong co thi lay tu header X-Auth-User

        String email = request.getUserEmail();
        if (email == null || email.isEmpty()) {
            email = httpRequest.getHeader("X-Auth-User");
        }
        order.setUserEmail(email);

        order.setTotalAmount(request.getTotalAmount());
        order.setShippingAddress(request.getShippingAddress());
        order.setFullName(request.getFullName());
        order.setPhone(request.getPhone());

        // VNPAY -> cho thanh toan xong moi xu ly Saga
        // COD   -> xu ly Saga ngay
        boolean isVNPay = "VNPAY".equalsIgnoreCase(request.getPaymentMethod());
        order.setStatus(isVNPay ? "PENDING_PAYMENT" : "PENDING");

        // 2. Tao OrderItems
        List<OrderItem> items = request.getItems().stream().map(dto -> {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(dto.getProductId());
            item.setQuantity(dto.getQuantity());
            item.setPrice(dto.getPrice());
            return item;
        }).collect(Collectors.toList());
        order.setItems(items);

        // 3. Tao Payment record de track trang thai thanh toan
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "COD");
        payment.setAmount(request.getTotalAmount());
        payment.setStatus("PENDING");
        order.setPayment(payment);

        // 4. Luu vao DB
        Order savedOrder = orderRepository.save(order);

        // 5. Phan nhanh xu ly theo phuong thuc thanh toan
        if (isVNPay) {
            // Xac dinh IP cua client
            String clientIp = getClientIp(httpRequest);
            if (request.getClientIp() != null && !request.getClientIp().isEmpty()) {
                clientIp = request.getClientIp();
            }

            // Sinh URL thanh toan VNPay (co chu ky HMAC-SHA512)
            String paymentUrl = vnPayService.buildPaymentUrl(
                savedOrder.getId(),
                savedOrder.getTotalAmount(),
                clientIp
            );

            System.out.println("[VNPay] Don hang #" + savedOrder.getId() + " - URL: " + paymentUrl);

            // Tra URL ve frontend de redirect
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getId());
            response.put("paymentMethod", "VNPAY");
            response.put("paymentUrl", paymentUrl);
            response.put("message", "Dang chuyen toi trang thanh toan VNPay...");
            return ResponseEntity.ok(response);

        } else {
            // COD: Bat dau Saga ngay (Inventory check -> Cart clear -> Notification)
            OrderCreatedEvent event = buildOrderCreatedEvent(savedOrder, request.getUserEmail(), items);
            eventPublisher.publishOrderCreated(event);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getId());
            response.put("paymentMethod", "COD");
            response.put("message", "Don hang dang duoc xu ly (COD Saga started). Order ID: " + savedOrder.getId());
            return ResponseEntity.accepted().body(response);
        }
    }

    /**
     * Lay danh sach don hang cua user (de hien thi Order History).
     * Duoc goi voi header X-Auth-User inject tu Gateway.
     */
    @GetMapping
    public ResponseEntity<?> getMyOrders(
            @RequestHeader(value = "X-Auth-User", required = false) String username) {
        if (username == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        // Tim theo username (email)
        List<Order> orders = orderRepository.findByUserEmailOrderByCreatedAtDesc(username);
        return ResponseEntity.ok(orders);
    }

    /**
     * Lay chi tiet 1 don hang (chi cho phep chu don hang xem).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-User", required = false) String username) {
        if (username == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Optional<Order> orderOpt = orderRepository.findByIdAndUserEmail(id, username);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Order not found or unauthorized");
        }
        return ResponseEntity.ok(orderOpt.get());
    }

    // =========================================================================
    // ADMIN ENDPOINTS
    // =========================================================================

    /**
     * Admin xem tat ca don hang (co phan trang va loc theo status).
     */
    @GetMapping("/admin/orders")
    public ResponseEntity<?> getAllOrdersAdmin(
            @RequestHeader(value = "X-Auth-Roles", required = false) String roles,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body("Forbidden: Admin role required");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return ResponseEntity.ok(orders);
    }

    /**
     * Admin cap nhat trang thai don hang.
     */
    @PatchMapping("/admin/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatusAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody,
            @RequestHeader(value = "X-Auth-Roles", required = false) String roles) {
        
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body("Forbidden: Admin role required");
        }
        
        String newStatus = requestBody.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body("Missing 'status' field");
        }
        
        List<String> validStatuses = Arrays.asList("PENDING", "PENDING_PAYMENT", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(newStatus)) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
        
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        order.setStatus(newStatus);
        // Co the cap nhat status payment neu can, tuy thuoc vao nghiep vu.
        orderRepository.save(order);
        
        return ResponseEntity.ok(order);
    }

    /**
     * Admin xem thong ke don hang.
     */
    @GetMapping("/admin/orders/stats")
    public ResponseEntity<?> getOrderStatsAdmin(
            @RequestHeader(value = "X-Auth-Roles", required = false) String roles) {
        
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body("Forbidden: Admin role required");
        }
        
        long totalOrders = orderRepository.countTotalOrders();
        Double totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0.0;
        
        List<Object[]> statusCounts = orderRepository.countOrdersByStatus();
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            String status = (String) row[0];
            Long count = (Long) row[1];
            ordersByStatus.put(status, count);
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("ordersByStatus", ordersByStatus);
        
        return ResponseEntity.ok(stats);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private OrderCreatedEvent buildOrderCreatedEvent(Order order, String userEmail, List<OrderItem> items) {
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrderId(order.getId());
        event.setUserId(order.getUserId());
        event.setUserEmail(userEmail);
        List<OrderCreatedEvent.OrderItemDto> eventItems = items.stream()
            .map(i -> new OrderCreatedEvent.OrderItemDto(i.getProductId(), i.getQuantity()))
            .collect(Collectors.toList());
        event.setItems(eventItems);
        return event;
    }

    /** Lay IP thuc cua client (ho tro reverse proxy / load balancer) */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Neu co nhieu IP (chain of proxies), lay IP dau tien
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }
}
