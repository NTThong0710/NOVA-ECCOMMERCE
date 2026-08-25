package com.ecommerce.order.presentation.dto;

import lombok.Data;
import java.util.List;

@Data
public class CheckoutRequest {
    private Long userId;
    private String userEmail;
    private Double totalAmount;
    private String shippingAddress;
    private String fullName;
    private String phone;
    private List<ItemDto> items;

    /** "VNPAY" hoặc "COD" — mặc định COD nếu không truyền */
    private String paymentMethod = "COD";

    /** IP của client, dùng để sinh URL VNPay (chống gian lận địa lý) */
    private String clientIp;

    @Data
    public static class ItemDto {
        private Long productId;
        private Integer quantity;
        private Double price;
    }
}
