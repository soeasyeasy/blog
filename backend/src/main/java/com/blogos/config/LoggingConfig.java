package com.blogos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

/**
 * 日志配置类
 * 配置请求日志记录
 */
@Configuration
public class LoggingConfig {
    
    /**
     * 配置请求日志过滤器
     * @return CommonsRequestLoggingFilter
     */
    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter loggingFilter = new CommonsRequestLoggingFilter();
        loggingFilter.setIncludeClientInfo(true);
        loggingFilter.setIncludeQueryString(true);
        loggingFilter.setIncludePayload(true);
        loggingFilter.setMaxPayloadLength(1000);
        loggingFilter.setIncludeHeaders(false);
        return loggingFilter;
    }
}