package com.ecommerce.auth.infrastructure.config;
import com.ecommerce.auth.infrastructure.security.JwtAuthFilter;
import com.ecommerce.auth.infrastructure.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity // Bật tính năng Phân quyền mức Hàm
public class SecurityConfig {

    private final UserRepository userRepository;
    private final JwtAuthFilter jwtAuthFilter;

    // 1. BẢN ĐỒ PHÂN QUYỀN
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Tắt chống giả mạo vì mình dùng Token
            .cors(org.springframework.security.config.Customizer.withDefaults()) // Bật CORS
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/error").permitAll() // Thả cửa: Ai cũng được Đăng nhập, Đăng ký và xem Lỗi
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/products/**").permitAll() // Thả cửa: Ai cũng được xem sản phẩm
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-resources/**").permitAll() // Cho phép truy cập tài liệu Swagger API
                .anyRequest().authenticated() // Cấm: Mọi hành động khác (như thêm/xoá SP) đều bắt buộc Đăng nhập
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Đặt anh bảo vệ JwtAuthFilter ra đứng trước cửa
            
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .map(user -> {
                    // 🔴 Kiểm tra tài khoản có bị vô hiệu hóa không
                    if (Boolean.FALSE.equals(user.getIsActive())) {
                        throw new org.springframework.security.core.userdetails.UsernameNotFoundException(
                            "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
                    }

                    String roleName = user.getRole() != null ? user.getRole().toUpperCase() : "CUSTOMER";
                    java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();

                    // Gắn nhãn Role gốc
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + roleName));

                    // ĐỊNH NGHĨA QUYỀN HẠN CHI TIẾT
                    if ("ADMIN".equals(roleName)) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("READ_ALL_USERS"));
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("UPDATE_USER"));
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("DELETE_USER"));
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("MANAGE_CATEGORIES"));
                    } else if ("SELLER".equals(roleName)) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("READ_OWN_PROFILE"));
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("MANAGE_OWN_PRODUCTS"));
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("VIEW_OWN_SALES"));
                    } else {
                        // CUSTOMER mặc định
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("READ_OWN_PROFILE"));
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("PLACE_ORDER"));
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADD_TO_CART"));
                    }

                    return new org.springframework.security.core.userdetails.User(
                            user.getUsername(),
                            user.getPassword(),
                            authorities
                    );
                })
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user"));
    }

    // 3. Công cụ Băm Mật Khẩu (Dùng chuẩn mã hoá BCrypt mạnh nhất hiện nay)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}