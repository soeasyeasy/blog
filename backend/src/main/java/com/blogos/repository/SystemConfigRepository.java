/**
 * 系统配置仓库接口
 * 提供系统配置数据访问接口，继承自 JpaRepository
 */
package com.blogos.repository;

import com.blogos.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// 仓库注解，标记这是一个数据访问仓库
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
}