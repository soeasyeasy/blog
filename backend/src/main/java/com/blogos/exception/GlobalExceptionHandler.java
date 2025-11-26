package com.blogos.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleRateLimitException(Exception ex, HttpServletResponse response) {
        // 检查是否是限流异常
        if (response.getStatus() == 429) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "请求过于频繁");
            errorResponse.put("message", "您发送的请求过多，请稍后再试。");
            
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
        }

        // 其他异常使用默认处理
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "内部服务器错误");
        errorResponse.put("message", "服务器发生未知错误");
        errorResponse.put("exception", ex.getMessage());
        log.error("exception",ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}