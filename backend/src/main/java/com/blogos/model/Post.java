/**
 * 文章实体类
 * 映射数据库中的 posts 表，包含文章的基本信息和关联数据
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
@Table(name = "posts")
public class Post {
    // 主键注解，标记这是主键字段
    @Id
    private String id;

    private String title;

    // 列注解，指定列长度为 1000
    @Column(length = 1000)
    private String excerpt;

    // Lob 注解，标记这是大对象字段
    // 列注解，指定列定义为 TEXT 类型
    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private String coverImage;
    private String date;
    private String category;
    private String author;
    
    private boolean featured;
    private int likes;

    // 元素集合注解，标记这是一个元素集合字段
    // 集合表注解，指定关联的表名和外键列名
    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    // 一对多注解，标记这是一对多关联关系
    // 级联注解，指定级联操作为全部
    // 连接列注解，指定外键列名
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "post_id")
    private List<Comment> comments = new ArrayList<>();
}