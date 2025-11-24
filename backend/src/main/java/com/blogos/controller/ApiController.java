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

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend access
public class ApiController {

    @Autowired
    private PostService postService;
    
    @Autowired
    private SystemConfigRepository configRepo;
    
    @Autowired
    private MemoRepository memoRepo;
    
    @Autowired
    private TodoRepository todoRepo;
    
    @Autowired
    private ScheduleRepository scheduleRepo;

    // --- Posts ---
    @GetMapping("/posts")
    public List<Post> getPosts() {
        return postService.getAllPosts();
    }

    @PostMapping("/posts")
    public Post savePost(@RequestBody Post post) {
        return postService.savePost(post);
    }

    @DeleteMapping("/posts/{id}")
    public void deletePost(@PathVariable String id) {
        postService.deletePost(id);
    }

    @PostMapping("/posts/{id}/like")
    public Post likePost(@PathVariable String id) {
        return postService.likePost(id);
    }

    @PostMapping("/posts/{id}/comments")
    public Post addComment(@PathVariable String id, @RequestBody Comment comment, @RequestParam(required = false) String parentId) {
        return postService.addComment(id, comment, parentId);
    }

    // --- Config ---
    @GetMapping("/config")
    public String getConfig() {
        return configRepo.findById("default")
                .map(SystemConfig::getConfigJson)
                .orElse("{}");
    }

    @PostMapping("/config")
    public void saveConfig(@RequestBody Map<String, Object> configMap) {
        // We accept a raw map to easily serialize to JSON string without defining strict POJOs for the complex config
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

    // --- Memos ---
    @GetMapping("/memos")
    public List<Memo> getMemos() {
        return memoRepo.findAll();
    }

    @PostMapping("/memos")
    public List<Memo> saveMemo(@RequestBody Memo memo) {
        if(memo.getId() == null) memo.setId(UUID.randomUUID().toString());
        memoRepo.save(memo);
        return memoRepo.findAll();
    }

    @DeleteMapping("/memos/{id}")
    public List<Memo> deleteMemo(@PathVariable String id) {
        memoRepo.deleteById(id);
        return memoRepo.findAll();
    }

    // --- Todos ---
    @GetMapping("/todos")
    public List<Todo> getTodos() {
        return todoRepo.findAll();
    }

    @PostMapping("/todos")
    public List<Todo> saveTodo(@RequestBody Todo todo) {
        if(todo.getId() == null) todo.setId(UUID.randomUUID().toString());
        todoRepo.save(todo);
        return todoRepo.findAll();
    }
    
    @PutMapping("/todos/{id}/toggle")
    public List<Todo> toggleTodo(@PathVariable String id) {
        Optional<Todo> t = todoRepo.findById(id);
        t.ifPresent(todo -> {
            todo.setCompleted(!todo.isCompleted());
            todoRepo.save(todo);
        });
        return todoRepo.findAll();
    }

    @DeleteMapping("/todos/{id}")
    public List<Todo> deleteTodo(@PathVariable String id) {
        todoRepo.deleteById(id);
        return todoRepo.findAll();
    }

    // --- Schedules ---
    @GetMapping("/schedules")
    public List<Schedule> getSchedules() {
        return scheduleRepo.findAll();
    }

    @PostMapping("/schedules")
    public List<Schedule> saveSchedule(@RequestBody Schedule schedule) {
        if(schedule.getId() == null) schedule.setId(UUID.randomUUID().toString());
        scheduleRepo.save(schedule);
        return scheduleRepo.findAll();
    }

    @DeleteMapping("/schedules/{id}")
    public List<Schedule> deleteSchedule(@PathVariable String id) {
        scheduleRepo.deleteById(id);
        return scheduleRepo.findAll();
    }
}