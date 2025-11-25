package com.blogos.util;

import com.blogos.interceptor.RateLimitInterceptor;

import java.lang.reflect.Field;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 限流测试工具类
 * 用于测试和调试限流功能
 */
public class RateLimitTestUtil {
    
    /**
     * 获取当前限流拦截器中的请求信息映射
     * 仅用于测试和调试目的
     */
    public static ConcurrentHashMap<String, ?> getRequestInfoMap(RateLimitInterceptor interceptor) {
        try {
            Field field = RateLimitInterceptor.class.getDeclaredField("requestInfoMap");
            field.setAccessible(true);
            return (ConcurrentHashMap<String, ?>) field.get(interceptor);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * 清除所有限流记录
     * 仅用于测试目的
     */
    public static void clearAllRecords(RateLimitInterceptor interceptor) {
        try {
            Field field = RateLimitInterceptor.class.getDeclaredField("requestInfoMap");
            field.setAccessible(true);
            ConcurrentHashMap<String, ?> map = (ConcurrentHashMap<String, ?>) field.get(interceptor);
            if (map != null) {
                map.clear();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}