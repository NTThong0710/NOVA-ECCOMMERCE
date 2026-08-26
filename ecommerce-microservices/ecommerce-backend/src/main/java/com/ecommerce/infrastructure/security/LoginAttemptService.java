package com.ecommerce.auth.infrastructure.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private final Map<String, AttemptInfo> memoryAttempts = new ConcurrentHashMap<>();
    private final Map<String, Long> memoryBlocks = new ConcurrentHashMap<>();

    private static class AttemptInfo {
        long count;
        long timestamp;
        AttemptInfo(long count, long timestamp) {
            this.count = count;
            this.timestamp = timestamp;
        }
    }

    public LoginAttemptService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void loginFailed(String username) {
        try {
            if (redisTemplate != null) {
                String attemptKey = "login_attempt:" + username;
                String blockKey = "login_block:" + username;
                
                Long attempts = redisTemplate.opsForValue().increment(attemptKey);
                redisTemplate.expire(attemptKey, Duration.ofHours(24));
                
                if (attempts != null && attempts >= 5) {
                    Duration blockDuration;
                    if (attempts == 5) {
                        blockDuration = Duration.ofMinutes(1);
                    } else if (attempts == 6) {
                        blockDuration = Duration.ofMinutes(5);
                    } else if (attempts == 7) {
                        blockDuration = Duration.ofMinutes(15);
                    } else {
                        blockDuration = Duration.ofHours(24);
                    }
                    redisTemplate.opsForValue().set(blockKey, "blocked", blockDuration);
                }
                return;
            }
        } catch (Exception ignored) {
        }

        long now = System.currentTimeMillis();
        memoryAttempts.compute(username, (k, v) -> {
            if (v == null || (now - v.timestamp) > 24 * 3600 * 1000) {
                return new AttemptInfo(1, now);
            }
            return new AttemptInfo(v.count + 1, v.timestamp);
        });

        AttemptInfo info = memoryAttempts.get(username);
        if (info != null && info.count >= 5) {
            long blockMs = (info.count == 5) ? 60000 : (info.count == 6) ? 300000 : 900000;
            memoryBlocks.put(username, now + blockMs);
        }
    }

    public void loginSucceeded(String username) {
        try {
            if (redisTemplate != null) {
                redisTemplate.delete("login_attempt:" + username);
                redisTemplate.delete("login_block:" + username);
            }
        } catch (Exception ignored) {
        }
        memoryAttempts.remove(username);
        memoryBlocks.remove(username);
    }

    public boolean isBlocked(String username) {
        try {
            if (redisTemplate != null) {
                String blockKey = "login_block:" + username;
                return Boolean.TRUE.equals(redisTemplate.hasKey(blockKey));
            }
        } catch (Exception ignored) {
        }
        Long until = memoryBlocks.get(username);
        if (until != null) {
            if (System.currentTimeMillis() < until) {
                return true;
            }
            memoryBlocks.remove(username);
        }
        return false;
    }

    public long getRemainingBlockTime(String username) {
        try {
            if (redisTemplate != null) {
                String blockKey = "login_block:" + username;
                Long expire = redisTemplate.getExpire(blockKey);
                return expire != null && expire > 0 ? expire : 0;
            }
        } catch (Exception ignored) {
        }
        Long until = memoryBlocks.get(username);
        if (until != null) {
            long remaining = (until - System.currentTimeMillis()) / 1000;
            return Math.max(remaining, 0);
        }
        return 0;
    }
}