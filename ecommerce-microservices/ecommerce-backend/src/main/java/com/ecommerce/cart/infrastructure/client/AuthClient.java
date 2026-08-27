package com.ecommerce.cart.infrastructure.client;

/**
 * AuthClient - không còn dùng FeignClient trong monolith.
 * Auth được xử lý qua header X-Auth-User từ Gateway.
 */
public interface AuthClient {
    UserDto getMe(String token);
}
