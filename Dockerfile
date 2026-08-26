# Multi-stage Dockerfile for API Gateway
FROM maven:3.9.5-eclipse-temurin-21 AS builder
WORKDIR /build
COPY ecommerce-microservices/api-gateway/pom.xml .
RUN mvn dependency:go-offline -B || true
COPY ecommerce-microservices/api-gateway/src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xms64m", "-Xmx256m", "-jar", "app.jar"]