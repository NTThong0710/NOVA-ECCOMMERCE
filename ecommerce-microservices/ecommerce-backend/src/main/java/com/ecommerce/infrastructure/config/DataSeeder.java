package com.ecommerce.auth.infrastructure.config;

import com.ecommerce.auth.domain.User;
import com.ecommerce.auth.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Admin account
        seedUserIfNotExists("admin", "admin@ecommerce.com", "Admin@123", "ADMIN", "Quản Trị Viên Hệ Thống", "0901234567");
        
        // 2. User admin email
        seedUserIfNotExists("thongnguyen07102004@gmail.com", "thongnguyen07102004@gmail.com", "Admin@123", "ADMIN", "Thông Nguyễn Admin", "0917374532");

        // 3. Customer account
        seedUserIfNotExists("customer", "customer@ecommerce.com", "Customer@123", "CUSTOMER", "Nguyễn Văn Khách", "0987654321");

        // 4. Seller account
        seedUserIfNotExists("seller", "seller@ecommerce.com", "Seller@123", "SELLER", "Đại Lý Chính Hãng BigTech", "0912345678");

        log.info("Auth Service DataSeeder completed successfully!");
    }

    private void seedUserIfNotExists(String username, String email, String rawPassword, String role, String fullName, String phone) {
        userRepository.findByUsername(username).ifPresentOrElse(
            user -> {
                // Ensure role is up-to-date
                if (!role.equals(user.getRole())) {
                    user.setRole(role);
                    userRepository.save(user);
                    log.info("Updated role for user [{}] to [{}]", username, role);
                }
            },
            () -> {
                User newUser = new User();
                newUser.setUsername(username);
                newUser.setEmail(email);
                newUser.setPassword(passwordEncoder.encode(rawPassword));
                newUser.setRole(role);
                newUser.setFullName(fullName);
                newUser.setPhone(phone);
                newUser.setIsActive(true);
                userRepository.save(newUser);
                log.info("Seeded user [{}] with role [{}]", username, role);
            }
        );
    }
}