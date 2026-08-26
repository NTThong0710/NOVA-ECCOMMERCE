package com.ecommerce.order.event;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReservedEvent {
    private Long orderId;
    private String status = "SUCCESS";
}
