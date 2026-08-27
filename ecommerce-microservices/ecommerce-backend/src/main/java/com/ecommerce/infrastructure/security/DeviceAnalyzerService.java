package com.ecommerce.auth.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

/**
 * DeviceAnalyzerService - phân tích thiết bị từ User-Agent header.
 * Sử dụng string parsing đơn giản thay vì ua_parser library.
 */
@Service
public class DeviceAnalyzerService {

    public DeviceAnalyzerService() {}

    public String extractDeviceName(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        if (ua == null || ua.isEmpty()) return "Unknown Device";

        String browser = "Browser";
        String os = "Unknown OS";

        if (ua.contains("Chrome") && !ua.contains("Edg")) browser = "Chrome";
        else if (ua.contains("Firefox")) browser = "Firefox";
        else if (ua.contains("Safari") && !ua.contains("Chrome")) browser = "Safari";
        else if (ua.contains("Edg")) browser = "Edge";

        if (ua.contains("Windows")) os = "Windows";
        else if (ua.contains("Mac OS")) os = "macOS";
        else if (ua.contains("Linux")) os = "Linux";
        else if (ua.contains("Android")) os = "Android";
        else if (ua.contains("iPhone") || ua.contains("iPad")) os = "iOS";

        return browser + " trên " + os;
    }

    public String extractIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        // X-Forwarded-For có thể chứa nhiều IP, lấy IP đầu tiên
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    public String extractDeviceId(HttpServletRequest request) {
        String ip = extractIpAddress(request);
        String deviceName = extractDeviceName(request);
        return java.util.Base64.getEncoder()
                .encodeToString((ip + "|" + deviceName).getBytes());
    }
}
