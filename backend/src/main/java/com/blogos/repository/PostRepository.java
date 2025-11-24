/**
 * 文章仓库接口
 * 提供文章数据访问接口，继承自 JpaRepository
 */
package com.blogos.repository;

import com.blogos.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

// 仓库注解，标记这是一个数据访问仓库
@Repository
public interface PostRepository extends JpaRepository<Post, String> {
    
    /**
     * 清除所有精选文章的精选状态
     * 使用 @Modifying 注解标记这是一个修改操作
     * 使用 @Query 注解定义 JPQL 查询语句
     */
    @Modifying
    @Query("UPDATE Post p SET p.featured = false WHERE p.featured = true")
    void clearAllFeatured();
}