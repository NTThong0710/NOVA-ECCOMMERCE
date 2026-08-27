package com.ecommerce.product.infrastructure.elasticsearch.repository;

import com.ecommerce.product.infrastructure.elasticsearch.document.ProductDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Collections;

/**
 * ProductSearchRepository - stub (Elasticsearch disabled).
 * Returns empty results; search handled by JPA queries.
 */
@Repository
public class ProductSearchRepository {

    public ProductDocument save(ProductDocument doc) {
        return doc; // no-op
    }

    public Page<ProductDocument> findByTitleContainingIgnoreCase(String title, Pageable pageable) {
        return new PageImpl<>(Collections.emptyList(), pageable, 0);
    }
}
