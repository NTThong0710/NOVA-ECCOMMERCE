package com.ecommerce.cart.infrastructure.client;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
}
