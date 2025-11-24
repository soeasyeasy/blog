/**
 * 日程安排仓库接口
 * 提供日程安排数据访问接口，继承自 JpaRepository
 */
package com.blogos.repository;

import com.blogos.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// 仓库注解，标记这是一个数据访问仓库
@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, String> {
}