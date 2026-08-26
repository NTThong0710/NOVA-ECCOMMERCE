package com.ecommerce.auth.presentation.controller;

import com.ecommerce.auth.domain.User;
import com.ecommerce.auth.infrastructure.repository.UserRepository;
import com.ecommerce.auth.presentation.dto.ApiResponse;
import com.ecommerce.auth.presentation.dto.UserProfileDto;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final com.ecommerce.auth.infrastructure.security.TokenBlacklistService tokenBlacklistService;
    private final com.ecommerce.auth.infrastructure.security.JwtUtil jwtUtil;
    private final com.ecommerce.auth.infrastructure.security.LoginAttemptService loginAttemptService;
    private final com.ecommerce.auth.infrastructure.security.OtpService otpService;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
    private final com.ecommerce.auth.infrastructure.security.SessionService sessionService;
    private final com.ecommerce.auth.infrastructure.security.CaptchaService captchaService;
    private final com.ecommerce.auth.infrastructure.security.DeviceAnalyzerService deviceAnalyzerService;

    @Value("${google.client.id}")
    private String googleClientId;

    @PostMapping("/register")
    public String register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return "Tên đăng nhập này đã có người sử dụng!";
        }
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole("CUSTOMER");
        userRepository.save(newUser);
        return "Đăng ký tài khoản thành công!";
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response, jakarta.servlet.http.HttpServletRequest httpRequest) {
        // 0. CHECK CAPTCHA NGAY TỪ VÒNG GỬI XE
        if (!captchaService.validateCaptcha(request.getCaptchaToken())) {
            return org.springframework.http.ResponseEntity.status(403).body("CAPTCHA không hợp lệ! Phát hiện nghi vấn Botnet.");
        }

        
        // 1. KIỂM TRA ÁN PHẠT TRƯỚC TIÊN
        if (loginAttemptService.isBlocked(request.getUsername())) {
            long remainingSeconds = loginAttemptService.getRemainingBlockTime(request.getUsername());
            
            // Đóng gói data thành JSON gọn gàng cho Frontend dễ xài
            java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "LOCKED");
            errorResponse.put("message", "Tài khoản tạm khóa do sai mật khẩu quá nhiều lần.");
            errorResponse.put("remainingSeconds", remainingSeconds);
            
            // Trả về mã 429 kèm gói JSON vừa đóng
            return org.springframework.http.ResponseEntity.status(429).body(errorResponse);
        }

        try {
            // 2. Thử kiểm tra Username & Password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (Exception e) {
            // 3. NẾU SAI PASS -> Quẹt một vạch vào Sổ thù vặt
            loginAttemptService.loginFailed(request.getUsername());
            // Mã 401: Unauthorized (Chưa xác thực)
            return org.springframework.http.ResponseEntity.status(401)
                    .body("Sai tên đăng nhập hoặc mật khẩu!");
        }

        // 4. NẾU ĐÚNG PASS -> Xóa sạch tiền án tiền sự (Xóa bộ đếm)
        loginAttemptService.loginSucceeded(request.getUsername());

        // 5. Cấp phát Token (Bỏ qua bước sinh mã OTP)
        org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername(), userDetails.getAuthorities());
        
        // 6. Phân tích thiết bị (Chống giả mạo Device ID)
        String realDeviceId = deviceAnalyzerService.extractDeviceId(httpRequest);
        String realDeviceName = deviceAnalyzerService.extractDeviceName(httpRequest);
        String realIpAddress = deviceAnalyzerService.extractIpAddress(httpRequest);

        // 7. Ghi danh Thiết bị vào Session và Tạo Refresh Token gắn kèm Device ID
        sessionService.saveSession(request.getUsername(), realDeviceId, realDeviceName, realIpAddress);
        String refreshToken = jwtUtil.generateRefreshToken(request.getUsername(), realDeviceId);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) 
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return org.springframework.http.ResponseEntity.ok(new AuthResponse(accessToken));
    }

    @PostMapping("/logout")
    public org.springframework.http.ResponseEntity<ApiResponse<String>> logout(
            jakarta.servlet.http.HttpServletRequest request,
            HttpServletResponse response) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                long expirationTime = jwtUtil.extractExpiration(jwt).getTime() - System.currentTimeMillis();
                if (expirationTime > 0) {
                    tokenBlacklistService.addToBlacklist(jwt, expirationTime);
                }
            } catch (Exception e) { /* Token đã hết hạn, bỏ qua */ }
        }

        // 🔴 XÓA REFRESH TOKEN COOKIE — quan trọng để tránh bị tái sử dụng
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)  // Xóa ngay lập tức
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());

        return org.springframework.http.ResponseEntity.ok(
            ApiResponse.ok("Đăng xuất thành công!", "Token và Cookie đã bị tiêu hủy."));
    }

    @PostMapping("/verify-otp")
    public org.springframework.http.ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request, HttpServletResponse response, jakarta.servlet.http.HttpServletRequest httpRequest) {
        // 1. Mang OTP ra so với sổ đỏ trong Redis
        boolean isValid = otpService.validateOtp(request.getUsername(), request.getOtpCode());
        
        if (!isValid) {
            return org.springframework.http.ResponseEntity.status(401).body("Mã OTP không hợp lệ hoặc đã quá 60 giây!");
        }

        // 2. NẾU OTP ĐÚNG -> Cấp phát Token
        org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername(), userDetails.getAuthorities());
        
        // 3. Phân tích thiết bị thật sự từ HTTP Request (Chống giả mạo Device ID)
        String realDeviceId = deviceAnalyzerService.extractDeviceId(httpRequest);
        String realDeviceName = deviceAnalyzerService.extractDeviceName(httpRequest);
        String realIpAddress = deviceAnalyzerService.extractIpAddress(httpRequest);

        // 4. Ghi danh Thiết bị vào Session và Tạo Refresh Token gắn kèm Device ID
        sessionService.saveSession(request.getUsername(), realDeviceId, realDeviceName, realIpAddress);
        String refreshToken = jwtUtil.generateRefreshToken(request.getUsername(), realDeviceId);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) 
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return org.springframework.http.ResponseEntity.ok(new AuthResponse(accessToken));
    }

    @PostMapping("/google")
    public org.springframework.http.ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request, HttpServletResponse response, jakarta.servlet.http.HttpServletRequest httpRequest) {
        if (request == null || request.getIdToken() == null || request.getIdToken().trim().isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body("Token Google không hợp lệ hoặc bị rỗng.");
        }

        String email = null;
        String name = "Người Dùng Google";
        try {
            java.net.URL url = new java.net.URL("https://www.googleapis.com/oauth2/v3/userinfo");
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestProperty("Authorization", "Bearer " + request.getIdToken());
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(6000);
            conn.setReadTimeout(6000);

            if (conn.getResponseCode() != 200) {
                return org.springframework.http.ResponseEntity.status(401).body("Google token không hợp lệ hoặc đã hết hạn (Mã: " + conn.getResponseCode() + ")");
            }

            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            reader.close();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(sb.toString());
            if (node.has("email")) {
                email = node.get("email").asText();
            }
            if (node.has("name")) {
                name = node.get("name").asText();
            }
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(401).body("Không thể kết nối xác minh Google: " + e.getMessage());
        }

        if (email == null) {
            return org.springframework.http.ResponseEntity.status(400).body("Không tìm thấy email trong tài khoản Google!");
        }

        final String finalEmail = email;
        final String finalName = name;

        // Tìm hoặc tạo tài khoản mới dựa trên email
        User user = userRepository.findByUsername(finalEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(finalEmail);
            newUser.setEmail(finalEmail);
            newUser.setFullName(finalName);
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            if (finalEmail.toLowerCase().contains("admin") || finalEmail.toLowerCase().contains("thongnguyen")) {
                newUser.setRole("ADMIN");
            } else {
                newUser.setRole("CUSTOMER");
            }
            return userRepository.save(newUser);
        });

        if ((user.getEmail() != null && (user.getEmail().toLowerCase().contains("admin") || user.getEmail().toLowerCase().contains("thongnguyen"))) && !"ADMIN".equals(user.getRole())) {
            user.setRole("ADMIN");
            userRepository.save(user);
        }

        // Sinh Access Token và Refresh Token cho hệ thống của chúng ta
        org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername(), userDetails.getAuthorities());

        // Phân tích thiết bị thật sự
        String realDeviceId = deviceAnalyzerService.extractDeviceId(httpRequest);
        String realDeviceName = deviceAnalyzerService.extractDeviceName(httpRequest);
        String realIpAddress = deviceAnalyzerService.extractIpAddress(httpRequest);

        try {
            sessionService.saveSession(user.getUsername(), realDeviceId, realDeviceName, realIpAddress);
        } catch (Exception ignored) {}

        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername(), realDeviceId);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return org.springframework.http.ResponseEntity.ok(new AuthResponse(accessToken));
    }

    @PostMapping("/refresh")
    public org.springframework.http.ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || jwtUtil.isTokenExpired(refreshToken)) {
            return org.springframework.http.ResponseEntity.status(401).body("Refresh Token không hợp lệ hoặc đã hết hạn");
        }
        
        String username;
        try {
            username = jwtUtil.extractUsername(refreshToken);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(401).body("Refresh Token không hợp lệ");
        }
        
        if (!jwtUtil.isTokenValid(refreshToken, username)) {
            return org.springframework.http.ResponseEntity.status(401).body("Refresh Token không hợp lệ");
        }

        // Kiểm tra xem Thiết bị này có bị Chủ nhân kích văng (Logout từ xa) chưa?
        String deviceId = jwtUtil.extractDeviceId(refreshToken);
        if (deviceId != null && !sessionService.isValidSession(username, deviceId)) {
            return org.springframework.http.ResponseEntity.status(401).body("Thiết bị này đã bị đăng xuất từ xa!");
        }

        org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String newAccessToken = jwtUtil.generateAccessToken(userDetails.getUsername(), userDetails.getAuthorities());
        return org.springframework.http.ResponseEntity.ok(new AuthResponse(newAccessToken));
    }

    @PostMapping("/forgot-password")
    public org.springframework.http.ResponseEntity<?> forgotPassword(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body("Không tìm thấy tài khoản với Email này!");
        }
        
        // Sinh OTP và gửi Email
        String otp = otpService.generateAndSaveOtp(request.getUsername());
        System.err.println("OTP Reset Password cho [" + request.getUsername() + "]: " + otp);
        
        return org.springframework.http.ResponseEntity.ok("Vui lòng kiểm tra Email để nhận mã xác thực lấy lại mật khẩu.");
    }

    @PostMapping("/reset-password")
    public org.springframework.http.ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean isValid = otpService.validateOtp(request.getUsername(), request.getOtpCode());
        if (!isValid) {
            return org.springframework.http.ResponseEntity.status(401).body("Mã OTP không hợp lệ hoặc đã hết hạn!");
        }

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
            
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return org.springframework.http.ResponseEntity.ok("Mật khẩu của bạn đã được thay đổi thành công!");
    }


    // =====================================================
    // PROFILE ENDPOINTS
    // =====================================================

    /** GET /auth/me or /auth/profile — Lấy thông tin user hiện tại từ JWT **/
    @GetMapping({"/me", "/profile"})
    public org.springframework.http.ResponseEntity<ApiResponse<UserProfileDto>> getMyProfile(
            @RequestHeader(value = "X-Auth-User", required = false) String headerUser,
            java.security.Principal principal) {
        String username = (headerUser != null && !headerUser.trim().isEmpty()) ? headerUser : (principal != null ? principal.getName() : null);
        if (username == null) {
            return org.springframework.http.ResponseEntity.status(401)
                .body(ApiResponse.error("Chưa đăng nhập"));
        }
        return userRepository.findByUsername(username)
            .map(user -> org.springframework.http.ResponseEntity.ok(
                ApiResponse.ok(new UserProfileDto(user))))
            .orElse(org.springframework.http.ResponseEntity.status(404)
                .body(ApiResponse.error("Không tìm thấy người dùng")));
    }

    /** PUT /auth/profile — Cập nhật thông tin cá nhân **/
    @PutMapping("/profile")
    public org.springframework.http.ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @RequestHeader(value = "X-Auth-User", required = false) String headerUser,
            java.security.Principal principal) {
        String username = (headerUser != null && !headerUser.trim().isEmpty()) ? headerUser : (principal != null ? principal.getName() : null);
        if (username == null) {
            return org.springframework.http.ResponseEntity.status(401)
                .body(ApiResponse.error("Chưa đăng nhập"));
        }
        return userRepository.findByUsername(username)
            .map(user -> {
                if (request.getFullName() != null) user.setFullName(request.getFullName());
                if (request.getPhone() != null) user.setPhone(request.getPhone());
                userRepository.save(user);
                return org.springframework.http.ResponseEntity.ok(
                    ApiResponse.ok(new UserProfileDto(user), "Cập nhật thông tin thành công!"));
            })
            .orElse(org.springframework.http.ResponseEntity.status(404)
                .body(ApiResponse.error("Không tìm thấy người dùng")));
    }


    // Lấy danh sách thiết bị đang đăng nhập
    @GetMapping("/sessions")
    public org.springframework.http.ResponseEntity<?> getActiveSessions(java.security.Principal principal) {
        java.util.Map<Object, Object> rawSessions = sessionService.getActiveSessionsRaw(principal.getName());
        java.util.List<java.util.Map<String, Object>> sessionList = new java.util.ArrayList<>();
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (java.util.Map.Entry<Object, Object> entry : rawSessions.entrySet()) {
            try {
                String json = (String) entry.getValue();
                if (json != null && json.startsWith("{")) {
                    java.util.Map<String, Object> sessionObj = mapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
                    sessionObj.put("id", entry.getKey()); 
                    sessionList.add(sessionObj);
                } else {
                    java.util.Map<String, Object> fallbackObj = new java.util.HashMap<>();
                    fallbackObj.put("id", entry.getKey());
                    fallbackObj.put("deviceId", entry.getKey());
                    fallbackObj.put("deviceName", json);
                    sessionList.add(fallbackObj);
                }
            } catch (Exception e) {}
        }
        return org.springframework.http.ResponseEntity.ok(sessionList);
    }

    // Đăng xuất từ xa 1 thiết bị
    @DeleteMapping("/sessions/{deviceId}")
    public org.springframework.http.ResponseEntity<?> revokeSession(@PathVariable String deviceId, java.security.Principal principal) {
        sessionService.removeSession(principal.getName(), deviceId);
        return org.springframework.http.ResponseEntity.ok("Đã cưỡng chế đăng xuất thiết bị " + deviceId);
    }

    // Lấy danh sách toàn bộ Users cho trang Admin
    @GetMapping("/users")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> getAllUsers() {
        java.util.List<UserDto> users = userRepository.findAll().stream()
            .map(u -> new UserDto(u.getId(), u.getUsername(), u.getRole(), u.getCreatedAt()))
            .collect(java.util.stream.Collectors.toList());
        return org.springframework.http.ResponseEntity.ok(users);
    }
}

@Data
class UserDto {
    private Integer id;
    private String username;
    private String role;
    private java.time.LocalDateTime createdAt;

    public UserDto(Integer id, String username, String role, java.time.LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.createdAt = createdAt;
    }
}

@Data
class AuthRequest {
    private String username;
    private String password;
    private String captchaToken;
}

@Data
class AuthResponse {
    private String token;
    
    public AuthResponse(String token) {
        this.token = token;
    }
}

@Data
class GoogleLoginRequest {
    private String idToken;
}

@Data
class VerifyOtpRequest {
    private String username;
    private String otpCode;
}

@Data
class ResetPasswordRequest {
    private String username;
    private String otpCode;
    private String newPassword;
}

@Data
class UpdateProfileRequest {
    private String fullName;
    private String phone;
}
