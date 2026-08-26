package com.ecommerce.product.presentation.controller;

import com.ecommerce.product.application.service.ProductService;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.presentation.dto.ProductRequest;
import com.ecommerce.product.presentation.dto.ProductResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.ecommerce.product.application.service.ExcelService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ExcelService excelService;

    @PostMapping("/import")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please select a file to upload.");
        }
        try {
            excelService.importProductsFromExcel(file);
            return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: " + file.getOriginalFilename());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body("Could not upload the file: " + file.getOriginalFilename() + "!");
        }
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> downloadFile() {
        String filename = "products.xlsx";
        InputStreamResource file = new InputStreamResource(excelService.exportProductsToExcel());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(file);
    }

    @GetMapping
    public ProductResponse getProducts(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) List<String> brands,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit) {

        int pageIndex = Math.max(page, 1) - 1;
        Pageable pageable = PageRequest.of(pageIndex, limit);
        Page<Product> productPage = productService.getProducts(search, category, minPrice, maxPrice, tags, brands, pageable);

        return new ProductResponse(
                productPage.getContent(),
                productPage.getTotalPages(),
                Math.max(page, 1),
                productPage.getTotalElements()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<Product>> getRelatedProducts(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getRelatedProducts(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<com.ecommerce.product.infrastructure.elasticsearch.document.ProductDocument>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {
        // Just a direct call to repo for demonstration of CQRS fast-read
        return ResponseEntity.ok(((com.ecommerce.product.application.service.impl.ProductServiceImpl)productService)
                .getSearchRepository()
                .findByTitleContainingIgnoreCase(query, PageRequest.of(page, limit)));
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return productService.getCategories();
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        Product createdProduct = productService.createProduct(request);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product updatedProduct = productService.updateProduct(id, request);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<List<com.ecommerce.product.domain.ProductImage>> uploadImage(
            @PathVariable Long id, 
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(productService.uploadProductImage(id, file));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id, 
            @PathVariable Long imageId) {
        try {
            productService.deleteProductImage(id, imageId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
