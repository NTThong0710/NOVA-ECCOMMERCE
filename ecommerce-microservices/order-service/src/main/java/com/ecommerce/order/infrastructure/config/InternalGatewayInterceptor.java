package com.ecommerce.order.infrastructure.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class InternalGatewayInterceptor implements HandlerInterceptor {

    @Value("${internal.gateway.secret:MySuperSecretInternalKey123!}")
    private String gatewaySecret;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String secretHeader = request.getHeader("X-Internal-Secret");
        if (secretHeader == null || !secretHeader.equals(gatewaySecret)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Forbidden: Direct access is not allowed");
            return false;
        }
        return true;
    }
}
