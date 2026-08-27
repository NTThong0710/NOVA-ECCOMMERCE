package com.ecommerce.product.infrastructure.elasticsearch.repository;

import com.ecommerce.product.infrastructure.elasticsearch.document.ProductDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Collections;

/**
 * ProductSearchRepository - stub (Elasticsearch disabled for Render free tier).
 * Returns empty results. Full-text search handled by JPA LIKE queries instead.
 */
@Repository
public class ProductSearchRepository {

    /** No-op save - Elasticsearch disabled */
    public ProductDocument save(ProductDocument doc) {
        return doc;
    }

    public Page<ProductDocument> findByTitleContainingIgnoreCase(String title, Pageable pageable) {
        return new PageImpl<>(Collections.emptyList(), pageable, 0);
    }
}
