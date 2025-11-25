/**
 * REST API 控制器
 * 提供博客系统的后端 API 接口，包括文章、配置、随手记、待办事项和日程安排的管理
 */
package com.blogos.controller;

import com.blogos.interceptor.RateLimitInterceptor;
import com.blogos.model.*;
import com.blogos.repository.*;
import com.blogos.service.PostService;
import com.blogos.util.InputValidator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

// REST 控制器注解，标记这是一个 RESTful Web 服务控制器
@RestController
// 请求映射注解，指定所有接口的根路径为 "/api"
@RequestMapping("/api")
// 跨域注解，允许前端应用访问后端 API
@CrossOrigin(origins = "*")
public class ApiController {
    private static final Logger logger = LoggerFactory.getLogger(ApiController.class);

    // 自动注入文章服务
    @Autowired
    private PostService postService;

    // 自动注入系统配置仓库
    @Autowired
    private SystemConfigRepository configRepo;

    // 自动注入随手记仓库
    @Autowired
    private MemoRepository memoRepo;

    // 自动注入待办事项仓库
    @Autowired
    private TodoRepository todoRepo;

    // 自动注入日程安排仓库
    @Autowired
    private ScheduleRepository scheduleRepo;

    // 自动注入用户仓库
    @Autowired
    private UserRepository userRepo;

    // 自动注入限流拦截器
    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;

    // 注入 HttpServletRequest 以获取客户端IP
    @Autowired
    private HttpServletRequest request;

    // --- 文章相关接口 ---

    /**
     * 获取所有文章
     *
     * @return 文章列表
     */
    @GetMapping("/posts")
    public List<Post> getPosts() {
        return postService.getAllPosts();
    }

    /**
     * 保存文章
     *
     * @param post 文章对象
     * @return 保存后的文章
     */
    @PostMapping("/posts")
    public Post savePost(@RequestBody Post post) {
        try {
            // 输入验证和清理
            if (post.getTitle() == null || post.getTitle().trim().isEmpty()) {
                logger.warn("Attempt to save post with empty title from IP: {}",
                        getClientIpAddress(request));
                throw new IllegalArgumentException("文章标题不能为空");
            }

            post.setTitle(InputValidator.sanitizeTitle(post.getTitle()));
            post.setContent(post.getContent());

            Post savedPost = postService.savePost(post);
            logger.info("Post saved successfully with ID: {} by IP: {}",
                    savedPost.getId(), getClientIpAddress(request));
            return savedPost;
        } catch (Exception e) {
            logger.error("Error saving post from IP: " + getClientIpAddress(request), e);
            throw new RuntimeException("保存文章失败: " + e.getMessage());
        }
    }

    /**
     * 删除文章
     *
     * @param id 文章 ID
     */
    @DeleteMapping("/posts/{id}")
    public void deletePost(@PathVariable String id) {
        postService.deletePost(id);
    }

    /**
     * 文章点赞
     *
     * @param id 文章 ID
     * @return 点赞后的文章
     */
    @PostMapping("/posts/{id}/like")
    public Post likePost(@PathVariable String id) {
        return postService.likePost(id);
    }

    /**
     * 添加评论
     *
     * @param id       文章 ID
     * @param comment  评论对象
     * @param parentId 父评论 ID（可选）
     * @return 添加评论后的文章
     */
    @PostMapping("/posts/{id}/comments")
    public Post addComment(@PathVariable String id, @RequestBody Comment comment, @RequestParam(required = false) String parentId) {
        try {
            // 输入验证和清理
            if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
                logger.warn("Attempt to add empty comment from IP: {}",
                        getClientIpAddress(request));
                throw new IllegalArgumentException("评论内容不能为空");
            }

            // 清理评论内容
            comment.setContent(InputValidator.sanitizeHtml(comment.getContent()));

            // 清理作者名称
            if (comment.getAuthor() != null) {
                comment.setAuthor(InputValidator.sanitizeHtml(comment.getAuthor()));
            }

            Post updatedPost = postService.addComment(id, comment, parentId);
            logger.info("Comment added to post ID: {} by IP: {}", id, getClientIpAddress(request));
            return updatedPost;
        } catch (Exception e) {
            logger.error("Error adding comment to post ID: " + id + " from IP: " + getClientIpAddress(request), e);
            throw new RuntimeException("添加评论失败: " + e.getMessage());
        }
    }

    // --- 配置相关接口 ---

    /**
     * 获取系统配置
     *
     * @return 配置 JSON 字符串
     */
    @GetMapping("/config")
    public String getConfig() {
        return configRepo.findById("default")
                .map(SystemConfig::getConfigJson)
                .orElse("{}");
    }

    /**
     * 保存系统配置
     *
     * @param configMap 配置映射
     */
    @PostMapping("/config")
    public void saveConfig(@RequestBody Map<String, Object> configMap) {
        // 我们接受一个原始映射，以便轻松序列化为 JSON 字符串，而无需为复杂的配置定义严格的 POJO
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode configJson = mapper.valueToTree(configMap);

            // 如果有账户信息，则对密码进行哈希处理
            JsonNode accounts = configJson.get("accounts");
            if (accounts != null && accounts.isArray()) {
                ArrayNode accountsArray = (ArrayNode) accounts;
                for (JsonNode account : accountsArray) {
                    if (account.has("password")) {
                        String password = account.get("password").asText();
                        // 验证密码强度
                        if (!InputValidator.isValidPassword(password)) {
                            logger.warn("Attempt to save config with weak password from IP: {}",
                                    getClientIpAddress(request));
                            throw new IllegalArgumentException("密码强度不足，必须至少8位且包含字母和数字");
                        }
                        String hashedPassword = hashPassword(password);

                        // 更新密码为哈希值
                        ((ObjectNode) account).put("password", hashedPassword);
                    }

                    // 验证用户名
                    if (account.has("username")) {
                        String username = account.get("username").asText();
                        if (!InputValidator.isValidUsername(username)) {
                            logger.warn("Attempt to save config with invalid username from IP: {}",
                                    getClientIpAddress(request));
                            throw new IllegalArgumentException("用户名格式不正确");
                        }
                    }
                }
            }

            // 清理和验证站点名称
            if (configJson.has("siteName")) {
                String siteName = configJson.get("siteName").asText();
                ((ObjectNode) configJson).put("siteName", InputValidator.sanitizeHtml(siteName));
            }

            String json = mapper.writeValueAsString(configJson);
            SystemConfig config = new SystemConfig();
            config.setId("default");
            config.setConfigJson(json);
            configRepo.save(config);

            logger.info("Configuration saved successfully by IP: {}", getClientIpAddress(request));
        } catch (Exception e) {
            logger.error("Error saving configuration from IP: " + getClientIpAddress(request), e);
            throw new RuntimeException("保存配置失败: " + e.getMessage());
        }
    }

    // --- 随手记相关接口 ---

    /**
     * 获取所有随手记
     *
     * @return 随手记列表
     */
    @GetMapping("/memos")
    public List<Memo> getMemos() {
        return memoRepo.findAll();
    }

    /**
     * 保存随手记
     *
     * @param memo 随手记对象
     * @return 更新后的随手记列表
     */
    @PostMapping("/memos")
    public List<Memo> saveMemo(@RequestBody Memo memo) {
        if (memo.getId() == null) memo.setId(UUID.randomUUID().toString());
        memoRepo.save(memo);
        return memoRepo.findAll();
    }

    /**
     * 删除随手记
     *
     * @param id 随手记 ID
     * @return 更新后的随手记列表
     */
    @DeleteMapping("/memos/{id}")
    public List<Memo> deleteMemo(@PathVariable String id) {
        memoRepo.deleteById(id);
        return memoRepo.findAll();
    }

    // --- 待办事项相关接口 ---

    /**
     * 获取所有待办事项
     *
     * @return 待办事项列表
     */
    @GetMapping("/todos")
    public List<Todo> getTodos() {
        return todoRepo.findAll();
    }

    /**
     * 保存待办事项
     *
     * @param todo 待办事项对象
     * @return 更新后的待办事项列表
     */
    @PostMapping("/todos")
    public List<Todo> saveTodo(@RequestBody Todo todo) {
        if (todo.getId() == null) todo.setId(UUID.randomUUID().toString());
        todoRepo.save(todo);
        return todoRepo.findAll();
    }

    /**
     * 切换待办事项完成状态
     *
     * @param id 待办事项 ID
     * @return 更新后的待办事项列表
     */
    @PutMapping("/todos/{id}/toggle")
    public List<Todo> toggleTodo(@PathVariable String id) {
        Optional<Todo> t = todoRepo.findById(id);
        t.ifPresent(todo -> {
            todo.setCompleted(!todo.isCompleted());
            todoRepo.save(todo);
        });
        return todoRepo.findAll();
    }

    /**
     * 删除待办事项
     *
     * @param id 待办事项 ID
     * @return 更新后的待办事项列表
     */
    @DeleteMapping("/todos/{id}")
    public List<Todo> deleteTodo(@PathVariable String id) {
        todoRepo.deleteById(id);
        return todoRepo.findAll();
    }

    // --- 日程安排相关接口 ---

    /**
     * 获取所有日程安排
     *
     * @return 日程安排列表
     */
    @GetMapping("/schedules")
    public List<Schedule> getSchedules() {
        return scheduleRepo.findAll();
    }

    /**
     * 保存日程安排
     *
     * @param schedule 日程安排对象
     * @return 更新后的日程安排列表
     */
    @PostMapping("/schedules")
    public List<Schedule> saveSchedule(@RequestBody Schedule schedule) {
        if (schedule.getId() == null) schedule.setId(UUID.randomUUID().toString());
        scheduleRepo.save(schedule);
        return scheduleRepo.findAll();
    }

    /**
     * 删除日程安排
     *
     * @param id 日程安排 ID
     * @return 更新后的日程安排列表
     */
    @DeleteMapping("/schedules/{id}")
    public List<Schedule> deleteSchedule(@PathVariable String id) {
        scheduleRepo.deleteById(id);
        return scheduleRepo.findAll();
    }

    // --- 用户认证相关接口 ---

    /**
     * 用户登录
     *
     * @param credentials 用户凭证
     * @return 认证令牌
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // 输入验证
        if (username == null || password == null) {
            logger.warn("Login attempt with missing credentials from IP: {}",
                    getClientIpAddress(request));
            return Map.of("success", false, "message", "用户名和密码不能为空");
        }

        // 清理和验证输入
        username = username.trim();
        if (!InputValidator.isValidUsername(username)) {
            logger.warn("Login attempt with invalid username format from IP: {}",
                    getClientIpAddress(request));
            return Map.of("success", false, "message", "用户名格式不正确");
        }

        // 简单的密码哈希处理
        String hashedPassword = hashPassword(password);

        // 从系统配置中查找用户信息
        Optional<SystemConfig> configOpt = configRepo.findById("default");
        if (configOpt.isPresent()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode configJson = mapper.readTree(configOpt.get().getConfigJson());

                // 查找用户账户信息
                JsonNode accounts = configJson.get("accounts");
                if (accounts != null && accounts.isArray()) {
                    for (JsonNode account : accounts) {
                        String configUsername = account.get("username").asText();
                        String configPasswordHash = account.get("password").asText();

                        if (configUsername.equals(username) && configPasswordHash.equals(hashedPassword)) {
                            // 记录成功登录
                            logger.info("Successful login for user: {} from IP: {}",
                                    username, getClientIpAddress(request));

                            // 生成一个简单的 JWT token（实际应用中应使用更安全的 JWT 库）
                            String token = Base64.getEncoder().encodeToString(
                                    ("{\"sub\":\"" + username + "\",\"exp\":" + (System.currentTimeMillis() + 24 * 60 * 60 * 1000) + "}").getBytes()
                            );

                            return Map.of("success", true, "token", token);
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Error during login process for user: " + username, e);
            }
        }

        // 记录失败的登录尝试
        logger.warn("Failed login attempt for user: {} from IP: {}",
                username, getClientIpAddress(request));

        return Map.of("success", false, "message", "用户名或密码错误");
    }

    // --- 限流管理接口 ---

    /**
     * 获取限流状态
     *
     * @return 限流状态信息
     */
    @GetMapping("/admin/rate-limit/status")
    public ResponseEntity<Map<String, Object>> getRateLimitStatus() {
        Map<String, Object> status = rateLimitInterceptor.getRateLimitStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * 重置指定IP的限流计数
     *
     * @param ip IP地址
     * @return 操作结果
     */
    @PostMapping("/admin/rate-limit/reset-ip")
    public ResponseEntity<Map<String, Object>> resetIpCount(@RequestParam String ip) {
        rateLimitInterceptor.resetIpCount(ip);
        return ResponseEntity.ok(Map.of("success", true, "message", "IP计数已重置"));
    }

    /**
     * 清除所有限流记录
     *
     * @return 操作结果
     */
    @PostMapping("/admin/rate-limit/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllRecords() {
        rateLimitInterceptor.clearAllRecords();
        return ResponseEntity.ok(Map.of("success", true, "message", "所有记录已清除"));
    }

    /**
     * 限流测试端点
     *
     * @return 测试响应
     */
    @GetMapping("/test/rate-limit")
    public ResponseEntity<Map<String, Object>> testRateLimit() {
        return ResponseEntity.ok(Map.of(
                "message", "Rate limit test endpoint",
                "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * 简单的密码哈希方法
     *
     * @param password 明文密码
     * @return 哈希后的密码
     */
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
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
}