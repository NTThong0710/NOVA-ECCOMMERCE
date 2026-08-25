package com.ecommerce.product.presentation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import jakarta.validation.Valid;
import java.util.List;

@Data
public class ProductRequest {
    
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be greater than or equal to 0")
    private Double price;

    @Min(value = 0, message = "Discount price must be greater than or equal to 0")
    private Double discountPrice;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity must be greater than or equal to 0")
    private Integer stockQuantity;

    private String brand;

    private Double weight;

    private String dimensions;

    private List<String> tags;

    @Valid
    private List<VariantRequest> variants;

    private List<String> images;

    private java.time.LocalDateTime discountStartDate;
    private java.time.LocalDateTime discountEndDate;
    private String metaTitle;
    private String metaDescription;
    private java.util.Map<String, String> attributes;
}
