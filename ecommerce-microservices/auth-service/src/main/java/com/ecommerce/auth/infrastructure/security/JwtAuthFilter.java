package com.ecommerce.auth.infrastructure.security;
import com.ecommerce.auth.domain.User;
import com.ecommerce.auth.infrastructure.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    
    // ĐỔI CHIẾN THUẬT: Dùng thẳng UserRepository để tránh bị lỗi Vòng lặp
    private final UserRepository userRepository;

    // Trang bị cuốn Sổ Đen
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        // Nếu Token này nằm trong danh sách đen của Redis -> Không cho đi tiếp!
        if (tokenBlacklistService.isBlacklisted(jwt)) {
            filterChain.doFilter(request, response);
            return; // Dừng tại đây, trả về 403 Forbidden!
        }
        final String username;
        try {
            username = jwtUtil.extractUsername(jwt);
        } catch (io.jsonwebtoken.ExpiredJwtException | io.jsonwebtoken.security.SignatureException | io.jsonwebtoken.MalformedJwtException e) {
            // Token expired or invalid. Ignore it and let the request proceed unauthenticated.
            // If the route requires auth, Spring Security will return 401 later.
            // If the route is /auth/refresh, it will proceed and read the Refresh Token cookie.
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // NÂNG CẤP: Không gọi Database nữa, lấy quyền trực tiếp từ Token cho chuẩn Stateless!
            if (jwtUtil.isTokenValid(jwt, username)) {
                
                java.util.List<String> roles = jwtUtil.extractRoles(jwt);
                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
                if (roles != null) {
                    for (String role : roles) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(role));
                    }
                }
                
                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                        username,
                        "", // Không cần mật khẩu ở bước này
                        authorities
                );

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
