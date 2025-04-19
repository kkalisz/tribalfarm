FROM gradle:8.4-jdk17 AS build
WORKDIR /app
COPY . /app/
RUN gradle --no-daemon build -x test

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/build/libs/*.jar /app/app.jar
EXPOSE 8080
ENV DB_URL=jdbc:postgresql://postgres:5432/tribal_farm
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
