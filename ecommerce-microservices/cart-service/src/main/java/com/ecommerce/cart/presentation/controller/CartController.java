package com.ecommerce.cart.presentation.controller;

import com.ecommerce.cart.domain.*;
import com.ecommerce.cart.infrastructure.client.*;
import com.ecommerce.cart.infrastructure.repository.*;
import com.ecommerce.cart.presentation.dto.*;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductClient productClient;

    @GetMapping
    public ResponseEntity<Cart> getMyCart(@RequestHeader(value = "X-Auth-User", required = false) String username) {
        if (username == null) {
            return ResponseEntity.status(401).build();
        }

        Cart cart = cartRepository.findByUserEmail(username).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserEmail(username);
            newCart.setTotalAmount(0.0);
            return cartRepository.save(newCart);
        });

        recalculateTotal(cart);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request, @RequestHeader(value = "X-Auth-User", required = false) String username) {
        if (username == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        ProductDto product = null;
        try {
            product = productClient.getProductById(Long.valueOf(request.getProductId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Product not found or Product Service is down");
        }

        if (product == null) {
            return ResponseEntity.badRequest().body("Product not found");
        }

        Cart cart = cartRepository.findByUserEmail(username).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserEmail(username);
            newCart.setTotalAmount(0.0);
            return cartRepository.save(newCart);
        });

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartAndProductId(cart, product.getId());
        
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProductId(product.getId());
            newItem.setQuantity(request.getQuantity());
            Double price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            newItem.setPriceAtAddition(price);
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        recalculateTotal(cart);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Integer productId, @RequestHeader(value = "X-Auth-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();

        Cart cart = cartRepository.findByUserEmail(username).orElse(null);
        if (cart == null) return ResponseEntity.notFound().build();

        cartItemRepository.findByCartAndProductId(cart, Long.valueOf(productId)).ifPresent(item -> {
            cartItemRepository.delete(item);
            cart.getItems().remove(item);
        });
        
        recalculateTotal(cart);
        return ResponseEntity.ok(cart);
    }

    private void recalculateTotal(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(item -> item.getPriceAtAddition() * item.getQuantity())
                .sum();
        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }
}
