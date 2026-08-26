package com.ecommerce.product.domain;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data // Phép thuật Lombok: Tự động đẻ ra các hàm get(), set() ẩn ở hậu trường
@AllArgsConstructor // Phép thuật: Tự đẻ ra hàm khởi tạo có truyền biến
@NoArgsConstructor  // Phép thuật: Tự đẻ ra hàm khởi tạo trống
public class Rating {
    private double rate; // Điểm đánh giá (VD: 4.5)
    private int count;   // Số lượt đánh giá
}

