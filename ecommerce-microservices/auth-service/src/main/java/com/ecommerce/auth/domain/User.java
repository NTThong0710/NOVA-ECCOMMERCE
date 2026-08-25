package com.ecommerce.auth.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity // Đánh dấu đây là Bảng trong Database
@Table(name = "users") // Database sẽ có thêm bảng tên là 'users'
@Data
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự động tăng ID
    private Integer id;

    // Tên đăng nhập (Bắt buộc nhập và không được trùng lặp)
    @Column(unique = true, nullable = false)
    private String username;

    // Mật khẩu (Sẽ được mã hoá loằng ngoằng trước khi lưu xuống Database)
    @Column(nullable = false)
    private String password;

    // Phân quyền (Ví dụ: "ROLE_USER" hoặc "ROLE_ADMIN")
    private String role;

    @Column(unique = true)
    private String email;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
