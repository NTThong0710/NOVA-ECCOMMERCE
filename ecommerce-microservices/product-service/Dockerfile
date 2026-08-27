FROM maven:3.9.5-eclipse-temurin-21 AS builder
WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline -B || true

COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# RAM optimization for Render free tier (512MB)
ENV JAVA_OPTS="-XX:+UseSerialGC -XX:MaxRAM=400m -Xms64m -Xmx300m -XX:MetaspaceSize=64m -XX:MaxMetaspaceSize=128m"

COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8082

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]