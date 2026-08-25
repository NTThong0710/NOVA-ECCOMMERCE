package com.ecommerce.auth.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Service
public class CaptchaService {
    
    @Value("${captcha.secret-key}")
    private String recaptchaSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean validateCaptcha(String captchaToken) {
        if (captchaToken == null || captchaToken.isEmpty()) {
            return false;
        }

        // Nếu người dùng chưa cấu hình Secret Key thật, thì tạm bỏ qua (Mock)
        if (recaptchaSecret == null || recaptchaSecret.contains("xxxxxxxx")) {
            System.err.println("⚠️ CẢNH BÁO: Chưa cấu hình Secret Key cho Google reCAPTCHA. Đang dùng chế độ Mock!");
            return !captchaToken.toLowerCase().contains("bot");
        }

        // Gọi API của Google để chấm điểm xem là Người hay Bot
        String verifyUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + recaptchaSecret + "&response=" + captchaToken;
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(verifyUrl, null, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && Boolean.TRUE.equals(body.get("success"))) {
                return true;
            } else {
                System.err.println("🤖 GOOGLE PHÁT HIỆN BOTNET: " + body);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi kết nối tới Google reCAPTCHA: " + e.getMessage());
        }

        return false;
    }
}
