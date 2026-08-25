package com.ecommerce.product.application.service;

import com.ecommerce.product.presentation.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getCategoryTree();
}
