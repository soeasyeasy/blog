/**
 * BlogOS 应用主类
 * Spring Boot 应用程序入口点
 */
package com.blogos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Spring Boot 应用程序注解，启用自动配置和组件扫描
@SpringBootApplication
public class BlogOsApplication {
    /**
     * 应用程序主方法
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        // 启动 Spring Boot 应用程序
        SpringApplication.run(BlogOsApplication.class, args);
    }
}