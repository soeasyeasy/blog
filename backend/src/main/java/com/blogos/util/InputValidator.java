package com.blogos.util;

import java.util.regex.Pattern;

/**
 * 输入验证工具类
 * 提供各种输入验证和清理功能
 */
public class InputValidator {
    
    // 用户名正则表达式：允许字母、数字、下划线，长度3-20位
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,20}$");
    
    // 密码正则表达式：至少8位，包含字母和数字
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$");
    
    // 邮箱正则表达式
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    
    // URL正则表达式
    private static final Pattern URL_PATTERN = Pattern.compile("^(http|https)://[a-zA-Z0-9.-]+(?:\\.[a-zA-Z]{2,})+(?:/.*)?$");
    
    /**
     * 验证用户名
     * @param username 用户名
     * @return 是否有效
     */
    public static boolean isValidUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        return USERNAME_PATTERN.matcher(username).matches();
    }
    
    /**
     * 验证密码
     * @param password 密码
     * @return 是否有效
     */
    public static boolean isValidPassword(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }
    
    /**
     * 验证邮箱
     * @param email 邮箱
     * @return 是否有效
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * 验证URL
     * @param url URL
     * @return 是否有效
     */
    public static boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        return URL_PATTERN.matcher(url).matches();
    }
    
    /**
     * 清理和转义HTML特殊字符
     * @param input 输入字符串
     * @return 清理后的字符串
     */
    public static String sanitizeHtml(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;");
    }
    
    /**
     * 清理和验证文章标题
     * @param title 标题
     * @return 清理后的标题
     */
    public static String sanitizeTitle(String title) {
        if (title == null) {
            return "";
        }
        
        // 限制标题长度
        if (title.length() > 200) {
            title = title.substring(0, 200);
        }
        
        // 清理HTML特殊字符
        return sanitizeHtml(title);
    }
    
    /**
     * 清理和验证文章内容
     * @param content 内容
     * @return 清理后的内容
     */
    public static String sanitizeContent(String content) {
        if (content == null) {
            return "";
        }
        
        // 限制内容长度 (100KB)
        if (content.length() > 102400) {
            content = content.substring(0, 102400);
        }
        
        return content;
    }
}