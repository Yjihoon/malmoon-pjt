# 1단계: React Build
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend/ .
RUN npm run build

# 2단계: Spring Boot Build (이미 빌드된 jar 사용한다고 가정)
FROM openjdk:17-jdk-slim
WORKDIR /app

# React 빌드 결과물 복사 (Spring Boot가 static으로 서빙)
COPY --from=frontend-builder /app/build ./apps/frontend/build

# Spring Boot JAR 복사
COPY apps/backend/build/libs/*.jar app.jar

# React 빌드 결과를 Spring Boot 리소스(static)에 넣기
RUN mkdir -p ./static && cp -r ./apps/frontend/build/* ./static/

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# !!