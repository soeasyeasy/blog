/**
 * 评论实体类
 * 映射数据库中的 comments 表，包含评论的基本信息和嵌套回复
 */
package com.blogos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

// Lombok 注解，自动生成 getter、setter、toString 等方法
@Data
// JPA 实体注解，标记这是一个实体类
@Entity
// 表注解，指定映射的数据库表名
@Table(name = "comments")
public class Comment {
    // 主键注解，标记这是主键字段
    @Id
    private String id;
    private String author;
    
    // 列注解，指定列长度为 2000
    @Column(length = 2000)
    private String content;
    
    private String date;
    private String avatar;

    // 自引用关系，用于嵌套回复
    // 一对多注解，标记这是一对多关联关系
    // 级联注解，指定级联操作为全部
    // 连接列注解，指定外键列名
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "parent_id")
    private List<Comment> replies = new ArrayList<>();
}