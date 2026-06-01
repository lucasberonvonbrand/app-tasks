FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

COPY backend/pom.xml .
RUN mvn -B -q dependency:go-offline

COPY backend/src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

ENV PORT=8080
EXPOSE 8080

COPY --from=builder /app/target/*.jar app.jar

CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]