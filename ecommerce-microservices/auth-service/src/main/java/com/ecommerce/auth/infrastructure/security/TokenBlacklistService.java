package com.ecommerce.auth.infrastructure.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private final Map<String, Long> memoryBlacklist = new ConcurrentHashMap<>();

    public TokenBlacklistService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void addToBlacklist(String token, long expirationTimeInMs) {
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set("blacklist:" + token, "revoked", Duration.ofMillis(expirationTimeInMs));
                return;
            }
        } catch (Exception ignored) {
        }
        memoryBlacklist.put("blacklist:" + token, System.currentTimeMillis() + expirationTimeInMs);
    }

    public boolean isBlacklisted(String token) {
        try {
            if (redisTemplate != null) {
                return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + token));
            }
        } catch (Exception ignored) {
        }
        Long expire = memoryBlacklist.get("blacklist:" + token);
        if (expire != null) {
            if (System.currentTimeMillis() < expire) {
                return true;
            } else {
                memoryBlacklist.remove("blacklist:" + token);
            }
        }
        return false;
    }
}