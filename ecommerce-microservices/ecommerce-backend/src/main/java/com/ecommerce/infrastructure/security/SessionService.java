package com.ecommerce.auth.infrastructure.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {
    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory fallback
    private final Map<String, Map<String, String>> memorySessions = new ConcurrentHashMap<>();

    public SessionService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveSession(String username, String deviceId, String deviceName, String ipAddress) {
        if (deviceId == null || deviceId.isEmpty()) {
            deviceId = "unknown-device";
            deviceName = "Unknown Device";
        }

        String location = "Localhost (Mạng nội bộ)";

        String key = "sessions:" + username;
        SessionData sessionData = new SessionData();
        sessionData.setDeviceId(deviceId);
        sessionData.setDeviceName(deviceName);
        sessionData.setIpAddress(ipAddress);
        sessionData.setLocation(location);
        sessionData.setLoginTime(java.time.LocalDateTime.now().toString());

        String jsonValue = deviceName;
        try {
            jsonValue = objectMapper.writeValueAsString(sessionData);
        } catch (Exception ignored) {
        }

        try {
            if (redisTemplate != null) {
                redisTemplate.opsForHash().put(key, deviceId, jsonValue);
                return;
            }
        } catch (Exception ignored) {
        }

        memorySessions.computeIfAbsent(username, k -> new ConcurrentHashMap<>()).put(deviceId, jsonValue);
    }

    public void removeSession(String username, String deviceId) {
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForHash().delete("sessions:" + username, deviceId);
            }
        } catch (Exception ignored) {
        }

        Map<String, String> userSessions = memorySessions.get(username);
        if (userSessions != null) {
            userSessions.remove(deviceId);
        }
    }

    public boolean isValidSession(String username, String deviceId) {
        try {
            if (redisTemplate != null) {
                return redisTemplate.opsForHash().hasKey("sessions:" + username, deviceId);
            }
        } catch (Exception ignored) {
        }

        Map<String, String> userSessions = memorySessions.get(username);
        return userSessions != null && userSessions.containsKey(deviceId);
    }

    public Map<Object, Object> getActiveSessionsRaw(String username) {
        try {
            if (redisTemplate != null) {
                return redisTemplate.opsForHash().entries("sessions:" + username);
            }
        } catch (Exception ignored) {
        }

        Map<String, String> userSessions = memorySessions.get(username);
        Map<Object, Object> res = new HashMap<>();
        if (userSessions != null) {
            res.putAll(userSessions);
        }
        return res;
    }
}

@Data
class SessionData {
    private String deviceId;
    private String deviceName;
    private String ipAddress;
    private String location;
    private String loginTime;
}

