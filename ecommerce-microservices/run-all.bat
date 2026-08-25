@echo off
echo =======================================================
echo     KHOI DONG HE THONG ECOMMERCE MICROSERVICES
echo =======================================================

echo Thiet lap bien moi truong...
set JAVA_HOME=D:\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%

echo Thiet lap bien moi truong RabbitMQ (CloudAMQP)...
set RABBITMQ_HOST=capybara.lmq.cloudamqp.com
set RABBITMQ_PORT=5672
set RABBITMQ_USER=kaukagsq
set RABBITMQ_PASS=KG1t7O5i45dveYrfTTLu7EmVkB9lwm8v
set RABBITMQ_VHOST=kaukagsq

echo 0. Starting Zipkin Tracing Server (Port 9411)...
if not exist "zipkin.jar" (
    echo [Downloading zipkin.jar from Maven Central...]
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/io/zipkin/zipkin-server/3.4.2/zipkin-server-3.4.2-exec.jar' -OutFile 'zipkin.jar'"
)
start "Zipkin Tracing Server (9411)" cmd /k "title Zipkin (9411) && java -jar zipkin.jar"
timeout /t 5

echo 1. Starting Discovery Server (Port 8761)...
start "Discovery Server (8761)" cmd /k "cd discovery-server && title Discovery Server (8761) && .\mvnw.cmd spring-boot:run"
timeout /t 15

echo 1. Starting API Gateway (Port 8080)...
start "API Gateway (8080)" cmd /k "cd api-gateway && title API Gateway (8080) && .\mvnw.cmd spring-boot:run"
timeout /t 4

echo 2. Starting Auth Service (Port 8081)...
start "Auth Service (8081)" cmd /k "cd auth-service && title Auth Service (8081) && .\mvnw.cmd spring-boot:run"
timeout /t 4

echo 3. Starting Product Service (Port 8082)...
start "Product Service (8082)" cmd /k "cd product-service && title Product Service (8082) && .\mvnw.cmd spring-boot:run"
timeout /t 4

echo 4. Starting Cart Service (Port 8083)...
start "Cart Service (8083)" cmd /k "cd cart-service && title Cart Service (8083) && .\mvnw.cmd spring-boot:run"
timeout /t 4

echo 5. Starting Order Service (Port 8084)...
start "Order Service (8084)" cmd /k "cd order-service && title Order Service (8084) && .\mvnw.cmd spring-boot:run"
timeout /t 4

echo 6. Starting Promotion Service (Port 8085)...
start "Promotion Service (8085)" cmd /k "cd promotion-service && title Promotion Service (8085) && .\mvnw.cmd spring-boot:run"
timeout /t 4

echo 7. Starting Inventory Service (Port 8086)...
start "Inventory Service (8086)" cmd /k "cd inventory-service && title Inventory Service (8086) && .\mvnw.cmd spring-boot:run"
timeout /t 4

echo 8. Starting Shipping Service (Port 8087)...
start "Shipping Service (8087)" cmd /k "cd shipping-service && title Shipping Service (8087) && .\mvnw.cmd spring-boot:run"
timeout /t 4

echo 9. Starting Notification Service (Port 8088)...
start "Notification Service (8088)" cmd /k "cd notification-service && title Notification Service (8088) && .\mvnw.cmd spring-boot:run"

echo =======================================================
echo Tat ca 9 services dang duoc khoi dong trong cac cua so rieng biet!
echo =======================================================
pause
