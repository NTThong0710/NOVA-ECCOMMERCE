package com.ecommerce.product.presentation.controller;

import com.ecommerce.product.application.service.CategoryService;
import com.ecommerce.product.presentation.dto.CategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public List<CategoryResponse> getCategoryTree() {
        return categoryService.getCategoryTree();
    }
}
