package com.ecommerce.product.infrastructure.seeder;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductImage;
import com.ecommerce.product.domain.ProductStatus;
import com.ecommerce.product.domain.ProductVariant;
import com.ecommerce.product.domain.Rating;
import com.ecommerce.product.infrastructure.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class ProductSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public ProductSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!productRepository.findBySku("TSHIRT-PREM-001").isPresent()) {
            Product product = new Product();
            product.setTitle("Premium Tech T-Shirt (With Variants)");
            product.setSlug("premium-tech-t-shirt-" + System.currentTimeMillis());
            product.setSku("TSHIRT-PREM-001");
            product.setPrice(45.99);
            product.setDescription("This is a premium technical T-shirt. Made with 100% organic cotton and advanced moisture-wicking technology.");
            product.setCategory("Men's Clothing");
            product.setBrand("TechWear");
            product.setWeight(200.0);
            product.setDimensions("20x15x5");
            product.setStatus(ProductStatus.ACTIVE);
            
            Rating rating = new Rating();
            rating.setRate(4.8);
            rating.setCount(150);
            product.setRating(rating);
            
            product.setTags(Arrays.asList("tshirt", "premium", "cotton"));
            
            ProductImage img1 = new ProductImage();
            img1.setImageUrl("https://fakestoreapi.com/img/71li-ujtlAL._AC_UX679_.jpg");
            img1.setProduct(product);
            img1.setIsPrimary(true);
            product.setImages(Arrays.asList(img1));

            ProductVariant var1 = new ProductVariant();
            var1.setProduct(product);
            var1.setSku("TSHIRT-PREM-001-BLK-M");
            var1.setColor("Black");
            var1.setSize("M");
            var1.setPrice(45.99);
            var1.setStockQuantity(50);

            ProductVariant var2 = new ProductVariant();
            var2.setProduct(product);
            var2.setSku("TSHIRT-PREM-001-WHT-L");
            var2.setColor("White");
            var2.setSize("L");
            var2.setPrice(49.99); // L is slightly more expensive
            var2.setStockQuantity(30);

            product.setVariants(Arrays.asList(var1, var2));
            product.setStockQuantity(80);

            productRepository.save(product);
            System.out.println("---------------------------------------------------------");
            System.out.println("Seeded Premium Tech T-Shirt with Advanced DB Schema!");
            System.out.println("---------------------------------------------------------");
        }
    }
}
