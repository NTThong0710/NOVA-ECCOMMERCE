package com.ecommerce.auth.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import ua_parser.Client;
import ua_parser.Parser;

@Service
public class DeviceAnalyzerService {
    
    private final Parser uaParser;

    public DeviceAnalyzerService() {
        try {
            this.uaParser = new Parser();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khởi tạo User-Agent Parser", e);
        }
    }

    // Trích xuất Tên thiết bị (Hệ điều hành + Trình duyệt)
    public String extractDeviceName(HttpServletRequest request) {
        String userAgentString = request.getHeader("User-Agent");
        if (userAgentString == null || userAgentString.isEmpty()) {
            return "Unknown Device";
        }
        
        Client client = uaParser.parse(userAgentString);
        String os = client.os.family;
        String browser = client.userAgent.family;
        
        return browser + " trên " + os; // VD: "Chrome trên Windows"
    }

    // Trích xuất IP thực
    public String extractIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    // Tạo ra ID Thiết bị dựa trên IP và đặc điểm máy (Tránh việc Hacker tự gửi deviceId giả)
    public String extractDeviceId(HttpServletRequest request) {
        String ip = extractIpAddress(request);
        String deviceName = extractDeviceName(request);
        
        // Gộp IP và Device Name lại thành một chuỗi Hash làm ID duy nhất
        return java.util.Base64.getEncoder().encodeToString((ip + "|" + deviceName).getBytes());
    }
}
