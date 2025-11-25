package com.blogos.interceptor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(RateLimitInterceptor.class);
    
    // 存储每个IP的请求计数器和时间戳
    private final ConcurrentHashMap<String, RequestInfo> requestInfoMap = new ConcurrentHashMap<>();
    
    // 限制每分钟最多请求数（默认值）
    private static final int DEFAULT_MAX_REQUESTS_PER_MINUTE = 60;
    
    // 对于登录接口，限制更严格，每分钟最多请求数（默认值）
    private static final int DEFAULT_MAX_LOGIN_REQUESTS_PER_MINUTE = 10;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String ip = getClientIpAddress(request);
        String uri = request.getRequestURI();
        
        // 检查是否是登录接口
        boolean isLoginEndpoint = uri.endsWith("/api/login");
        
        // 获取当前时间
        long currentTime = System.currentTimeMillis();
        
        // 获取或创建该IP的请求信息
        RequestInfo requestInfo = requestInfoMap.computeIfAbsent(ip, k -> new RequestInfo());
        
        synchronized (requestInfo) {
            // 检查时间窗口是否已过期（1分钟）
            if (currentTime - requestInfo.windowStart.get() > TimeUnit.MINUTES.toMillis(1)) {
                // 重置窗口
                requestInfo.windowStart.set(currentTime);
                requestInfo.requestCount.set(0);
            }
            
            // 增加请求计数
            int currentCount = requestInfo.requestCount.incrementAndGet();
            
            // 根据接口类型检查限流
            int maxRequests = isLoginEndpoint ? DEFAULT_MAX_LOGIN_REQUESTS_PER_MINUTE : DEFAULT_MAX_REQUESTS_PER_MINUTE;
            
            // 记录请求信息
            logger.debug("Rate limit check - IP: {}, URI: {}, Count: {}/{}", ip, uri, currentCount, maxRequests);
            
            if (currentCount > maxRequests) {
                // 超过限流阈值，拒绝请求
                logger.warn("Rate limit exceeded - IP: {}, URI: {}, Count: {}", ip, uri, currentCount);
                response.setStatus(429); // Too Many Requests
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Rate limit exceeded. Please try again later.\"}");
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 获取客户端真实IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        // 尝试从多个HTTP头中获取IP地址
        String[] headers = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };
        
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // 如果包含多个IP地址，取第一个
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                // 处理IPv6本地地址
                if ("0:0:0:0:0:0:0:1".equals(ip)) {
                    return "127.0.0.1";
                }
                return ip;
            }
        }
        
        // 如果所有HTTP头都无法获取IP，则使用远程地址
        String remoteAddr = request.getRemoteAddr();
        // 处理IPv6本地地址
        if ("0:0:0:0:0:0:0:1".equals(remoteAddr)) {
            return "127.0.0.1";
        }
        return remoteAddr;
    }
    
    /**
     * 获取当前限流状态（用于管理端点）
     * @return 限流状态信息
     */
    public Map<String, Object> getRateLimitStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("totalIps", requestInfoMap.size());
        status.put("defaultMaxRequestsPerMinute", DEFAULT_MAX_REQUESTS_PER_MINUTE);
        status.put("defaultMaxLoginRequestsPerMinute", DEFAULT_MAX_LOGIN_REQUESTS_PER_MINUTE);
        
        // 获取当前时间
        long currentTime = System.currentTimeMillis();
        
        // 收集详细信息
        List<Map<String, Object>> ipDetails = new ArrayList<>();
        for (Map.Entry<String, RequestInfo> entry : requestInfoMap.entrySet()) {
            String ip = entry.getKey();
            RequestInfo info = entry.getValue();
            
            Map<String, Object> ipInfo = new HashMap<>();
            ipInfo.put("ip", ip);
            ipInfo.put("requestCount", info.requestCount.get());
            ipInfo.put("windowStart", info.windowStart.get());
            ipInfo.put("windowExpireTime", info.windowStart.get() + TimeUnit.MINUTES.toMillis(1));
            ipInfo.put("timeToExpireMs", info.windowStart.get() + TimeUnit.MINUTES.toMillis(1) - currentTime);
            
            ipDetails.add(ipInfo);
        }
        
        status.put("ipDetails", ipDetails);
        return status;
    }
    
    /**
     * 重置指定IP的限流计数
     * @param ip IP地址
     */
    public void resetIpCount(String ip) {
        RequestInfo info = requestInfoMap.get(ip);
        if (info != null) {
            synchronized (info) {
                info.requestCount.set(0);
            }
        }
    }
    
    /**
     * 清除所有限流记录
     */
    public void clearAllRecords() {
        requestInfoMap.clear();
    }
    
    /**
     * 存储请求信息的内部类
     */
    private static class RequestInfo {
        AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
        AtomicInteger requestCount = new AtomicInteger(0);
    }
}