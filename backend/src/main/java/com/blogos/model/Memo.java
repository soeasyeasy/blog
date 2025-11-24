/**
 * 随手记实体类
 * 映射数据库中的 memos 表，包含随手记的基本信息和附件
 */
package com.blogos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

// Lombok 注解，自动生成 getter、setter、toString 等方法
@Data
// JPA 实体注解，标记这是一个实体类
@Entity
// 表注解，指定映射的数据库表名
@Table(name = "memos")
public class Memo {
    // 主键注解，标记这是主键字段
    @Id
    private String id;

    // Lob 注解，标记这是大对象字段
    // 列注解，指定列定义为 TEXT 类型
    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private String date;

    // 元素集合注解，标记这是一个元素集合字段
    // 集合表注解，指定关联的表名和外键列名
    @ElementCollection
    @CollectionTable(name = "memo_images", joinColumns = @JoinColumn(name = "memo_id"))
    @Column(name = "image_url")
    private List<String> images;

    // 元素集合注解，标记这是一个元素集合字段
    // 集合表注解，指定关联的表名和外键列名
    @ElementCollection
    @CollectionTable(name = "memo_tags", joinColumns = @JoinColumn(name = "memo_id"))
    @Column(name = "tag")
    private List<String> tags;
}