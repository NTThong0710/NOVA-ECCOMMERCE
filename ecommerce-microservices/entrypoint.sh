#!/bin/sh
echo "=========================================="
echo " Starting Cloud Microservices Cluster"
echo "=========================================="

echo "[1/6] Starting Discovery Server..."
java -XX:+UseSerialGC -Xms32m -Xmx64m -jar /app/discovery-server.jar &
sleep 12

echo "[2/6] Starting Auth Service..."
java -XX:+UseSerialGC -Xms32m -Xmx70m -jar /app/auth-service.jar &

echo "[3/6] Starting Product Service..."
java -XX:+UseSerialGC -Xms32m -Xmx70m -jar /app/product-service.jar &

echo "[4/6] Starting Order Service..."
java -XX:+UseSerialGC -Xms32m -Xmx70m -jar /app/order-service.jar &

echo "[5/6] Starting Promotion Service..."
java -XX:+UseSerialGC -Xms32m -Xmx64m -jar /app/promotion-service.jar &
sleep 6

echo "[6/6] Starting API Gateway on port \..."
exec java -XX:+UseSerialGC -Xms32m -Xmx80m -Dserver.port=\ -jar /app/api-gateway.jar