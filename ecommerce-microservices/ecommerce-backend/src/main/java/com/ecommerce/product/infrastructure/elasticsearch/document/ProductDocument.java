package com.ecommerce.product.infrastructure.elasticsearch.document;

import lombok.Data;
import java.util.List;

/**
 * ProductDocument - stub (Elasticsearch disabled).
 * Search uses JPA queries instead.
 */
@Data
public class ProductDocument {
    private String id;
    private String title;
    private String sku;
    private Double price;
    private String description;
    private String category;
    private String brand;
    private List<String> tags;
    private String status;
}
