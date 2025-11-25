/**
 * 验证用户名格式
 * @param username 用户名
 * @returns 是否有效
 */
export const validateUsername = (username: string): boolean => {
    if (!username) return false;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * 验证密码强度
 * @param password 密码
 * @returns 是否有效
 */
export const validatePassword = (password: string): boolean => {
    if (!password) return false;
    // 至少8位，包含字母和数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
};

/**
 * 清理HTML特殊字符
 * @param input 输入字符串
 * @returns 清理后的字符串
 */
export const sanitizeHtml = (input: string): string => {
    if (!input) return input;
    
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
};

/**
 * 清理和验证文章标题
 * @param title 标题
 * @returns 清理后的标题
 */
export const sanitizeTitle = (title: string): string => {
    if (!title) return "";
    
    // 限制标题长度
    if (title.length > 200) {
        title = title.substring(0, 200);
    }
    
    // 清理HTML特殊字符
    return sanitizeHtml(title);
};

/**
 * 清理和验证文章内容
 * @param content 内容
 * @returns 清理后的内容
 */
export const sanitizeContent = (content: string): string => {
    if (!content) return "";
    
    // 限制内容长度 (100KB)
    if (content.length > 102400) {
        content = content.substring(0, 102400);
    }
    
    return content;
};