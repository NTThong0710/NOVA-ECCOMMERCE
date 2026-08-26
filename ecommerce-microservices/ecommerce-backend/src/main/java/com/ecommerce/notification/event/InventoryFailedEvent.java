package com.ecommerce.notification.event;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryFailedEvent {
    private Long orderId;
    private Long userId;
    private String userEmail;
    private String reason;
}
