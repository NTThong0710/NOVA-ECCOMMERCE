package com.ecommerce.auth.infrastructure.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    
    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    private final Random random = new Random();
    private final Map<String, OtpEntry> memoryOtp = new ConcurrentHashMap<>();

    private static class OtpEntry {
        String code;
        long expireTime;
        OtpEntry(String code, long expireTime) {
            this.code = code;
            this.expireTime = expireTime;
        }
    }

    public OtpService(@Autowired(required = false) StringRedisTemplate redisTemplate,
                      @Autowired(required = false) JavaMailSender mailSender) {
        this.redisTemplate = redisTemplate;
        this.mailSender = mailSender;
    }

    // 1. Máy in mã OTP
    public String generateAndSaveOtp(String username) {
        String otp = String.format("%06d", random.nextInt(999999));
        
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set("otp:" + username, otp, Duration.ofSeconds(60));
            }
        } catch (Exception ignored) {
        }
        memoryOtp.put("otp:" + username, new OtpEntry(otp, System.currentTimeMillis() + 60000));
        
        // GỬI EMAIL
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(username);
                message.setSubject("Hệ thống Big Tech - Mã xác thực Đăng nhập (OTP)");
                message.setText("Chào bạn,\n\nMã OTP để tiếp tục đăng nhập vào hệ thống là: " + otp + "\n\nMã này sẽ hết hạn trong 60 giây.");
                mailSender.send(message);
                System.out.println("Đã gửi OTP về Email: " + username);
            } catch (Exception e) {
                System.err.println("Lỗi gửi Email: " + e.getMessage());
            }
        }
        
        return otp;
    }

    // 2. Cổng kiểm duyệt OTP
    public boolean validateOtp(String username, String otpCode) {
        try {
            if (redisTemplate != null) {
                String savedOtp = redisTemplate.opsForValue().get("otp:" + username);
                if (savedOtp != null && savedOtp.equals(otpCode)) {
                    redisTemplate.delete("otp:" + username);
                    return true;
                }
            }
        } catch (Exception ignored) {
        }

        OtpEntry entry = memoryOtp.get("otp:" + username);
        if (entry != null) {
            if (System.currentTimeMillis() <= entry.expireTime && entry.code.equals(otpCode)) {
                memoryOtp.remove("otp:" + username);
                return true;
            }
            if (System.currentTimeMillis() > entry.expireTime) {
                memoryOtp.remove("otp:" + username);
            }
        }
        return false;
    }
}

