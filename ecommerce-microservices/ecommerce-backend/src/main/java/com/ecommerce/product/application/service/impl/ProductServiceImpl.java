package com.ecommerce.product.application.service.impl;

import com.ecommerce.product.application.service.ProductService;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductImage;
import com.ecommerce.product.domain.ProductStatus;
import com.ecommerce.product.domain.ProductVariant;
import com.ecommerce.product.infrastructure.repository.ProductRepository;
import com.ecommerce.product.infrastructure.repository.ProductVariantRepository;
import com.ecommerce.product.presentation.dto.ProductRequest;
import com.ecommerce.product.presentation.dto.VariantRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;
import com.ecommerce.product.infrastructure.messaging.ProductEventPublisher;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.ecommerce.product.infrastructure.elasticsearch.repository.ProductSearchRepository;
import com.ecommerce.product.infrastructure.elasticsearch.document.ProductDocument;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductEventPublisher eventPublisher;
    private final ProductSearchRepository searchRepository;
    private final com.ecommerce.product.application.service.ImageUploadService imageUploadService;

    public ProductServiceImpl(ProductRepository productRepository, 
                              ProductVariantRepository variantRepository, 
                              ProductEventPublisher eventPublisher, 
                              @org.springframework.beans.factory.annotation.Autowired(required = false) ProductSearchRepository searchRepository,
                              com.ecommerce.product.application.service.ImageUploadService imageUploadService) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.eventPublisher = eventPublisher;
        this.searchRepository = searchRepository;
        this.imageUploadService = imageUploadService;
    }

    public ProductSearchRepository getSearchRepository() {
        return searchRepository;
    }

    private ProductDocument mapToDocument(Product product) {
        ProductDocument doc = new ProductDocument();
        doc.setId(product.getId().toString());
        doc.setTitle(product.getTitle());
        doc.setSku(product.getSku());
        doc.setPrice(product.getPrice());
        doc.setDescription(product.getDescription());
        doc.setCategory(product.getCategory());
        doc.setBrand(product.getBrand());
        doc.setTags(product.getTags());
        doc.setStatus(product.getStatus().name());
        return doc;
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Product with SKU " + request.getSku() + " already exists.");
        }
        
        if (request.getVariants() != null) {
            for (VariantRequest vr : request.getVariants()) {
                if (variantRepository.existsBySku(vr.getSku())) {
                    throw new IllegalArgumentException("Variant with SKU " + vr.getSku() + " already exists.");
                }
            }
        }

        Product product = new Product();
        product.setStatus(ProductStatus.ACTIVE);
        mapRequestToEntity(request, product);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        
        Product savedProduct = productRepository.save(product);
        
        // Sync to Elasticsearch if enabled
        if (searchRepository != null) {
            searchRepository.save(mapToDocument(savedProduct));
        }
        
        // Publish events for inventory init
        eventPublisher.publishProductCreatedEvent(savedProduct.getId(), savedProduct.getSku());
        if (savedProduct.getVariants() != null) {
            for (ProductVariant pv : savedProduct.getVariants()) {
                eventPublisher.publishProductCreatedEvent(savedProduct.getId(), pv.getSku());
            }
        }
        
        return savedProduct;
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "product", key = "#id"),
        @CacheEvict(value = "products", allEntries = true)
    })
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Product with SKU " + request.getSku() + " already exists.");
        }

        if (product.getImages() != null) {
            product.getImages().clear();
        }
        if (product.getVariants() != null) {
            product.getVariants().clear();
        }

        mapRequestToEntity(request, product);
        product.setUpdatedAt(LocalDateTime.now());
        
        Product updatedProduct = productRepository.save(product);
        
        // Sync to Elasticsearch if enabled
        if (searchRepository != null) {
            searchRepository.save(mapToDocument(updatedProduct));
        }
        
        return updatedProduct;
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "product", key = "#id"),
        @CacheEvict(value = "products", allEntries = true)
    })
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        // Soft delete
        product.setStatus(ProductStatus.ARCHIVED);
        product.setUpdatedAt(LocalDateTime.now());
        Product deletedProduct = productRepository.save(product);
        
        // Sync to Elasticsearch if enabled
        if (searchRepository != null) {
            searchRepository.save(mapToDocument(deletedProduct));
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "product", key = "#id")
    public Product getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        if (product.getStatus() == ProductStatus.ARCHIVED) {
            throw new RuntimeException("Product is archived");
        }
        Hibernate.initialize(product.getImages());
        Hibernate.initialize(product.getVariants());
        Hibernate.initialize(product.getTags());
        return product;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "{#title, #category, #minPrice, #maxPrice, #tags, #brands, #pageable.pageNumber, #pageable.pageSize}")
    public Page<Product> getProducts(String title, String category, Double minPrice, Double maxPrice, List<String> tags, List<String> brands, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Product> spec = 
            com.ecommerce.product.infrastructure.repository.ProductSpecification.filterProducts(
                title, category, minPrice, maxPrice, tags, brands);
        Page<Product> page = productRepository.findAll(spec, pageable);
        page.getContent().forEach(p -> {
            Hibernate.initialize(p.getImages());
            Hibernate.initialize(p.getVariants());
            Hibernate.initialize(p.getTags());
        });
        return page;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "related_products", key = "#id")
    public List<Product> getRelatedProducts(Long id) {
        Product product = getProductById(id);
        
        // Simple recommendation: same category or brand, excluding itself
        org.springframework.data.jpa.domain.Specification<Product> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.notEqual(root.get("id"), id));
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));
            
            List<jakarta.persistence.criteria.Predicate> orPredicates = new ArrayList<>();
            if (product.getCategory() != null) {
                orPredicates.add(cb.equal(root.get("category"), product.getCategory()));
            }
            if (product.getBrand() != null) {
                orPredicates.add(cb.equal(root.get("brand"), product.getBrand()));
            }
            
            if (!orPredicates.isEmpty()) {
                predicates.add(cb.or(orPredicates.toArray(new jakarta.persistence.criteria.Predicate[0])));
            }
            
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        
        List<Product> related = productRepository.findAll(spec, org.springframework.data.domain.PageRequest.of(0, 5)).getContent();
        related.forEach(p -> {
            Hibernate.initialize(p.getImages());
            Hibernate.initialize(p.getVariants());
            Hibernate.initialize(p.getTags());
        });
        return related;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories")
    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    private void mapRequestToEntity(ProductRequest request, Product product) {
        product.setTitle(request.getTitle());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setBrand(request.getBrand());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setTags(request.getTags() != null ? new ArrayList<>(request.getTags()) : new ArrayList<>());

        // Map Flash Sale & SEO & EAV fields
        product.setDiscountStartDate(request.getDiscountStartDate());
        product.setDiscountEndDate(request.getDiscountEndDate());
        product.setMetaTitle(request.getMetaTitle());
        product.setMetaDescription(request.getMetaDescription());
        product.setAttributes(request.getAttributes());

        // Auto-generate slug if title exists
        if (product.getTitle() != null) {
            String generatedSlug = product.getTitle().toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");
            product.setSlug(generatedSlug + "-" + System.currentTimeMillis()); // Append timestamp to ensure uniqueness
        }

        int totalStock = request.getStockQuantity() != null ? request.getStockQuantity() : 0;

        if (request.getImages() != null) {
            List<ProductImage> images = request.getImages().stream().map(url -> {
                ProductImage img = new ProductImage();
                img.setImageUrl(url);
                img.setProduct(product);
                return img;
            }).collect(Collectors.toList());
            if (product.getImages() == null) {
                product.setImages(images);
            } else {
                product.getImages().addAll(images);
            }
        }

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            totalStock = 0;
            List<ProductVariant> variants = new ArrayList<>();
            for (VariantRequest vr : request.getVariants()) {
                ProductVariant pv = new ProductVariant();
                pv.setProduct(product);
                pv.setSku(vr.getSku());
                pv.setColor(vr.getColor());
                pv.setSize(vr.getSize());
                pv.setPrice(vr.getPrice());
                pv.setStockQuantity(vr.getStockQuantity());
                variants.add(pv);
                totalStock += (vr.getStockQuantity() != null ? vr.getStockQuantity() : 0);
            }
            if (product.getVariants() == null) {
                product.setVariants(variants);
            } else {
                product.getVariants().addAll(variants);
            }
        }
        
        product.setStockQuantity(totalStock);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "product", key = "#id"),
        @CacheEvict(value = "products", allEntries = true)
    })
    public List<ProductImage> uploadProductImage(Long id, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        Product product = getProductById(id);
        
        java.util.Map<String, String> uploadResult = imageUploadService.uploadImage(file, "products/" + id);
                
        ProductImage productImage = new ProductImage();
        productImage.setImageUrl(uploadResult.get("url"));
        productImage.setCloudinaryPublicId(uploadResult.get("public_id"));
        productImage.setProduct(product);
        
        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
            productImage.setIsPrimary(true);
        } else if (product.getImages().isEmpty()) {
            productImage.setIsPrimary(true);
        }
        
        product.getImages().add(productImage);
        productRepository.save(product);
        
        return product.getImages();
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "product", key = "#id"),
        @CacheEvict(value = "products", allEntries = true)
    })
    public void deleteProductImage(Long id, Long imageId) throws java.io.IOException {
        Product product = getProductById(id);
        
        ProductImage imageToRemove = null;
        for (ProductImage img : product.getImages()) {
            if (img.getId().equals(imageId)) {
                imageToRemove = img;
                break;
            }
        }
        
        if (imageToRemove != null) {
            if (imageToRemove.getCloudinaryPublicId() != null) {
                imageUploadService.deleteImage(imageToRemove.getCloudinaryPublicId());
            }
            
            product.getImages().remove(imageToRemove);
            productRepository.save(product);
        }
    }
}
