/**
 * 系统配置实体类
 * 映射数据库中的 system_config 表，存储站点的完整配置信息
 */
package com.blogos.model;

import jakarta.persistence.*;
import lombok.Data;

// Lombok 注解，自动生成 getter、setter、toString 等方法
@Data
// JPA 实体注解，标记这是一个实体类
@Entity
// 表注解，指定映射的数据库表名
@Table(name = "system_config")
public class SystemConfig {
    // 主键注解，标记这是主键字段，默认值为 "default"
    @Id
    private String id = "default";

    // 存储整个 SiteConfig JSON 对象
    // Lob 注解，标记这是大对象字段
    // 列注解，指定列定义为 TEXT 类型
    @Lob
    @Column(columnDefinition = "TEXT")
    private String configJson;
}