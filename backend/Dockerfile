FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src/ src/
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S dentaflow && adduser -S dentaflow -G dentaflow

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

RUN chown -R dentaflow:dentaflow /app

USER dentaflow

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
