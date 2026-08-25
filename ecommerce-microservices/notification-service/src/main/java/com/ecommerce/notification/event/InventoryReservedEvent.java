package com.ecommerce.notification.event;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReservedEvent {
    private Long orderId;
    private Long userId;
    private String userEmail;
    private Double totalAmount;
    private String shippingAddress;
}
