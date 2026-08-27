package com.ecommerce.product.infrastructure.config;

import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ config - disabled for cloud deployment (Render free tier).
 * RabbitMQ không cần thiết cho product-service standalone.
 */
@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE_NAME = "ecommerce.exchange";
}
