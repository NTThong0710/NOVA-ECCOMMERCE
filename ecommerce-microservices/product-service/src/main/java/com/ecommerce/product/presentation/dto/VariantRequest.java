package com.ecommerce.product.presentation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VariantRequest {

    @NotBlank(message = "Variant SKU is required")
    private String sku;

    private String color;

    private String size;

    @NotNull(message = "Variant price is required")
    @Min(value = 0, message = "Variant price must be non-negative")
    private Double price;

    @NotNull(message = "Variant stock quantity is required")
    @Min(value = 0, message = "Variant stock must be non-negative")
    private Integer stockQuantity;
}
