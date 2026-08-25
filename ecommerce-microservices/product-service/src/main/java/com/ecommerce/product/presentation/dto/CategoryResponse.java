package com.ecommerce.product.presentation.dto;

import lombok.Data;

import java.util.List;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private List<CategoryResponse> children;
}
