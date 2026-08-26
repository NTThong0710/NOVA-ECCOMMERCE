package com.ecommerce.order.event;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryFailedEvent {
    private Long orderId;
    private String reason;
}
