# 使用官方 OpenJDK 运行环境作为基础镜像
FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 将 Maven 构建的 jar 文件复制到容器中
COPY target/blogos-backend-0.0.1-SNAPSHOT.jar app.jar

# 暴露端口
EXPOSE 8080

# 运行应用程序
ENTRYPOINT ["java", "-jar", "app.jar"]