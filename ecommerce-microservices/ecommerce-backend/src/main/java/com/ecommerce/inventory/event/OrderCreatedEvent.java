package com.ecommerce.inventory.event;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEvent {
    private Long orderId;
    private Long userId;
    private List<OrderItemDto> items;
    private String userEmail;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long productId;
        private Integer quantity;
    }
}
