/**
 * 待办事项实体类
 * 映射数据库中的 todos 表，包含待办事项的基本信息
 */
package com.blogos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

// Lombok 注解，自动生成 getter、setter、toString 等方法
@Data
// JPA 实体注解，标记这是一个实体类
@Entity
// 表注解，指定映射的数据库表名
@Table(name = "todos")
public class Todo {
    // 主键注解，标记这是主键字段
    @Id
    private String id;
    private String text;
    private boolean completed;
    private String priority; // low, medium, high
    private String date;
}