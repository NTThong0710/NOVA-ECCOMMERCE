package com.ecommerce.product.infrastructure.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * InternalGatewayInterceptor - cho phép mọi request khi deploy standalone.
 * Khi chạy qua Gateway thì Gateway sẽ inject header X-Internal-Secret.
 * Khi frontend gọi thẳng (không qua Gateway), vẫn cho phép.
 */
@Component
public class InternalGatewayInterceptor implements HandlerInterceptor {

    @Value("${internal.gateway.secret:MySuperSecretInternalKey123!}")
    private String gatewaySecret;

    @Value("${internal.gateway.enforce:false}")
    private boolean enforceGateway;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Nếu không enforce (deploy standalone / free tier), cho phép tất cả request
        if (!enforceGateway) {
            return true;
        }
        // Nếu enforce, kiểm tra secret header
        String secretHeader = request.getHeader("X-Internal-Secret");
        if (secretHeader == null || !secretHeader.equals(gatewaySecret)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Forbidden: Direct access is not allowed");
            return false;
        }
        return true;
    }
}
