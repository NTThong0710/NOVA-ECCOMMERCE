package com.ecommerce.auth.presentation.dto;

import lombok.Data;

@Data
public class UserProfileDto {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private Boolean isActive;
    private java.time.LocalDateTime createdAt;

    public UserProfileDto(com.ecommerce.auth.domain.User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.phone = user.getPhone();
        this.role = user.getRole();
        this.isActive = user.getIsActive();
        this.createdAt = user.getCreatedAt();
    }
}
