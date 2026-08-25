package com.ecommerce.cart.infrastructure.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service", path = "/auth")
public interface AuthClient {
    
    @GetMapping("/me")
    UserDto getMe(@RequestHeader("Authorization") String token);
}
