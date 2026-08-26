# Stage 1: Build the application using Maven
FROM maven:3.9.5-eclipse-temurin-21 AS builder
WORKDIR /build

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build package
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Create minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built jar
COPY --from=builder /build/target/*.jar app.jar

# Run with optimized memory for Cloud Free Tier
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xms64m", "-Xmx256m", "-jar", "app.jar"]