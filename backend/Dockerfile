# Stage 1: Build Java Application
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal Production JRE Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /workspace/target/music-discovery-backend-1.0.0-SNAPSHOT.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=local
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
