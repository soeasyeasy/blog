/**
 * REST API 控制器
 * 提供博客系统的后端 API 接口，包括文章、配置、随手记、待办事项和日程安排的管理
 */
package com.blogos.controller;

import com.blogos.model.*;
import com.blogos.repository.*;
import com.blogos.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

// REST 控制器注解，标记这是一个 RESTful Web 服务控制器
@RestController
// 请求映射注解，指定所有接口的根路径为 "/api"
@RequestMapping("/api")
// 跨域注解，允许前端应用访问后端 API
@CrossOrigin(origins = "*") 
public class ApiController {

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

    // --- 文章相关接口 ---
    
    /**
     * 获取所有文章
     * @return 文章列表
     */
    @GetMapping("/posts")
    public List<Post> getPosts() {
        return postService.getAllPosts();
    }

    /**
     * 保存文章
     * @param post 文章对象
     * @return 保存后的文章
     */
    @PostMapping("/posts")
    public Post savePost(@RequestBody Post post) {
        return postService.savePost(post);
    }

    /**
     * 删除文章
     * @param id 文章 ID
     */
    @DeleteMapping("/posts/{id}")
    public void deletePost(@PathVariable String id) {
        postService.deletePost(id);
    }

    /**
     * 文章点赞
     * @param id 文章 ID
     * @return 点赞后的文章
     */
    @PostMapping("/posts/{id}/like")
    public Post likePost(@PathVariable String id) {
        return postService.likePost(id);
    }

    /**
     * 添加评论
     * @param id 文章 ID
     * @param comment 评论对象
     * @param parentId 父评论 ID（可选）
     * @return 添加评论后的文章
     */
    @PostMapping("/posts/{id}/comments")
    public Post addComment(@PathVariable String id, @RequestBody Comment comment, @RequestParam(required = false) String parentId) {
        return postService.addComment(id, comment, parentId);
    }

    // --- 配置相关接口 ---
    
    /**
     * 获取系统配置
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
     * @param configMap 配置映射
     */
    @PostMapping("/config")
    public void saveConfig(@RequestBody Map<String, Object> configMap) {
        // 我们接受一个原始映射，以便轻松序列化为 JSON 字符串，而无需为复杂的配置定义严格的 POJO
        try {
            String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(configMap);
            SystemConfig config = new SystemConfig();
            config.setId("default");
            config.setConfigJson(json);
            configRepo.save(config);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // --- 随手记相关接口 ---
    
    /**
     * 获取所有随手记
     * @return 随手记列表
     */
    @GetMapping("/memos")
    public List<Memo> getMemos() {
        return memoRepo.findAll();
    }

    /**
     * 保存随手记
     * @param memo 随手记对象
     * @return 更新后的随手记列表
     */
    @PostMapping("/memos")
    public List<Memo> saveMemo(@RequestBody Memo memo) {
        if(memo.getId() == null) memo.setId(UUID.randomUUID().toString());
        memoRepo.save(memo);
        return memoRepo.findAll();
    }

    /**
     * 删除随手记
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
     * @return 待办事项列表
     */
    @GetMapping("/todos")
    public List<Todo> getTodos() {
        return todoRepo.findAll();
    }

    /**
     * 保存待办事项
     * @param todo 待办事项对象
     * @return 更新后的待办事项列表
     */
    @PostMapping("/todos")
    public List<Todo> saveTodo(@RequestBody Todo todo) {
        if(todo.getId() == null) todo.setId(UUID.randomUUID().toString());
        todoRepo.save(todo);
        return todoRepo.findAll();
    }
    
    /**
     * 切换待办事项完成状态
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
     * @return 日程安排列表
     */
    @GetMapping("/schedules")
    public List<Schedule> getSchedules() {
        return scheduleRepo.findAll();
    }

    /**
     * 保存日程安排
     * @param schedule 日程安排对象
     * @return 更新后的日程安排列表
     */
    @PostMapping("/schedules")
    public List<Schedule> saveSchedule(@RequestBody Schedule schedule) {
        if(schedule.getId() == null) schedule.setId(UUID.randomUUID().toString());
        scheduleRepo.save(schedule);
        return scheduleRepo.findAll();
    }

    /**
     * 删除日程安排
     * @param id 日程安排 ID
     * @return 更新后的日程安排列表
     */
    @DeleteMapping("/schedules/{id}")
    public List<Schedule> deleteSchedule(@PathVariable String id) {
        scheduleRepo.deleteById(id);
        return scheduleRepo.findAll();
    }
}