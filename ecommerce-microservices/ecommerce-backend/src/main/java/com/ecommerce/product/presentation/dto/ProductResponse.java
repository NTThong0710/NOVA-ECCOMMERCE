package com.ecommerce.product.presentation.dto;
import com.ecommerce.product.domain.Product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private List<Product> data;       // Chứa mảng dữ liệu sản phẩm
    private int totalPages;           // Tổng số trang
    private int currentPage;          // Trang hiện tại
    private long totalElements;       // Tổng số sản phẩm thỏa mãn điều kiện
}
