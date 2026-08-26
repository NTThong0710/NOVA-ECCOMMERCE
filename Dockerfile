FROM maven:3.9.5-eclipse-temurin-21 AS builder
WORKDIR /build

# Build Discovery Server
COPY ecommerce-microservices/discovery-server/pom.xml ./discovery-server/
COPY ecommerce-microservices/discovery-server/src ./discovery-server/src
RUN cd discovery-server && mvn clean package -DskipTests -B

# Build Auth Service
COPY ecommerce-microservices/auth-service/pom.xml ./auth-service/
COPY ecommerce-microservices/auth-service/src ./auth-service/src
RUN cd auth-service && mvn clean package -DskipTests -B

# Build Product Service
COPY ecommerce-microservices/product-service/pom.xml ./product-service/
COPY ecommerce-microservices/product-service/src ./product-service/src
RUN cd product-service && mvn clean package -DskipTests -B

# Build Order Service
COPY ecommerce-microservices/order-service/pom.xml ./order-service/
COPY ecommerce-microservices/order-service/src ./order-service/src
RUN cd order-service && mvn clean package -DskipTests -B

# Build Promotion Service
COPY ecommerce-microservices/promotion-service/pom.xml ./promotion-service/
COPY ecommerce-microservices/promotion-service/src ./promotion-service/src
RUN cd promotion-service && mvn clean package -DskipTests -B

# Build API Gateway
COPY ecommerce-microservices/api-gateway/pom.xml ./api-gateway/
COPY ecommerce-microservices/api-gateway/src ./api-gateway/src
RUN cd api-gateway && mvn clean package -DskipTests -B

# Stage 2: Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /build/discovery-server/target/*.jar discovery-server.jar
COPY --from=builder /build/auth-service/target/*.jar auth-service.jar
COPY --from=builder /build/product-service/target/*.jar product-service.jar
COPY --from=builder /build/order-service/target/*.jar order-service.jar
COPY --from=builder /build/promotion-service/target/*.jar promotion-service.jar
COPY --from=builder /build/api-gateway/target/*.jar api-gateway.jar

COPY ecommerce-microservices/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]