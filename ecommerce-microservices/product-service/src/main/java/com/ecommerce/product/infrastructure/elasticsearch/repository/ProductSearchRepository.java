package com.ecommerce.product.infrastructure.elasticsearch.repository;

import com.ecommerce.product.infrastructure.elasticsearch.document.ProductDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
    Page<ProductDocument> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
