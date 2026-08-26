package com.ecommerce.product.infrastructure.config;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.infrastructure.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long count = productRepository.count();
        System.out.println("CURRENT PRODUCT COUNT: " + count);
        if (count < 20) {
            System.out.println("---------------------------------------------------------");
            System.out.println("Database is empty. Seeding products from FakeStore API...");
            System.out.println("---------------------------------------------------------");
            RestTemplate restTemplate = new RestTemplate();
            try {
                String url = "https://fakestoreapi.com/products";
                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                
                ObjectMapper mapper = new ObjectMapper();
                List<Product> products = mapper.readValue(response.getBody(), new TypeReference<List<Product>>(){});
                
                // Set id to null so JPA knows to insert new records rather than updating
                for (Product p : products) {
                    p.setId(null);
                    p.setStatus(com.ecommerce.product.domain.ProductStatus.ACTIVE);
                }
                
                productRepository.saveAll(products);
                System.out.println("Successfully seeded " + products.size() + " products into the database.");
            } catch (Exception e) {
                System.err.println("Failed to seed data: " + e.getMessage());
            }
        } else {
            System.out.println("Products already exist in the database. Seeding skipped.");
        }
    }
}
