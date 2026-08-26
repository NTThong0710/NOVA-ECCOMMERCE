package com.ecommerce.product.presentation.controller;

import com.ecommerce.product.application.service.ProductService;
import com.ecommerce.product.domain.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class ProductGraphController {

    private final ProductService productService;

    public ProductGraphController(ProductService productService) {
        this.productService = productService;
    }

    @QueryMapping
    public Product productById(@Argument Long id) {
        return productService.getProductById(id);
    }

    @QueryMapping
    public List<Product> products(@Argument Integer page, @Argument Integer limit) {
        int p = page != null ? page - 1 : 0;
        int l = limit != null ? limit : 10;
        return productService.getProducts("", "", null, null, null, null, PageRequest.of(p, l)).getContent();
    }
}
