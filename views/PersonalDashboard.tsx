/**
 * 个人仪表板视图组件
 * 提供个人任务管理和日程安排功能，包括日历视图、待办事项和日程安排
 */

import React, { useState, useEffect, useMemo } from "react";
// 导入图标组件
import { CheckSquare, Square, Trash2, Plus, Calendar, Clock, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
// 导入类型定义
import { Todo, Schedule, SiteConfig } from "../types";
// 导入 API 工具
import { api } from "../lib/api";

// 个人仪表板视图组件属性接口
interface PersonalDashboardProps {
  config: SiteConfig;  // 站点配置
}

// 个人仪表板视图组件
export const PersonalDashboard = ({ config }: PersonalDashboardProps) => {
  // 状态管理：待办事项、日程安排和当前日期
  const [todos, setTodos] = useState<Todo[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  // 解构站点配置中的主题颜色
  const { themeColor = "#0071e3" } = config;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  // 新待办事项和日程安排状态管理
  const [newTodo, setNewTodo] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<'low'|'medium'|'high'>("medium");
  const [newScheduleTitle, setNewScheduleTitle] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("");

  // 组件挂载时获取待办事项和日程安排数据
  useEffect(() => {
    Promise.all([
        api.getTodos(),
        api.getSchedules()
    ]).then(([fetchedTodos, fetchedSchedules]) => {
        setTodos(fetchedTodos);
        setSchedules(fetchedSchedules);
    });
  }, []);

  // 使用 useMemo 计算当月天数，仅在当前日期变化时重新计算
  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  // 使用 useMemo 计算当月第一天是星期几，仅在当前日期变化时重新计算
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  /**
   * 切换月份
   * @param offset 月份偏移量
   */
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // 筛选选定日期的待办事项和日程安排
  const dayTodos = todos.filter(t => t.date === selectedDateStr);
  const daySchedules = schedules.filter(s => s.date === selectedDateStr).sort((a,b) => a.time.localeCompare(b.time));

  /**
   * 添加待办事项
   * @param e 表单事件
   */
  const addTodo = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newTodo.trim()) return;
      const updated = await api.addTodo(newTodo, newTodoPriority, selectedDateStr);
      setTodos(updated);
      setNewTodo("");
  };

  /**
   * 添加日程安排
   * @param e 表单事件
   */
  const addSchedule = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newScheduleTitle.trim() || !newScheduleTime.trim()) return;
      const updated = await api.addSchedule(newScheduleTitle, newScheduleTime, selectedDateStr);
      setSchedules(updated);
      setNewScheduleTitle("");
      setNewScheduleTime("");
  };

  /**
   * 删除待办事项
   * @param id 待办事项 ID
   */
  const deleteTodo = async (id: string) => setTodos(await api.deleteTodo(id));
  
  /**
   * 切换待办事项完成状态
   * @param id 待办事项 ID
   */
  const toggleTodo = async (id: string) => setTodos(await api.toggleTodo(id));
  
  /**
   * 删除日程安排
   * @param id 日程安排 ID
   */
  const deleteSchedule = async (id: string) => setSchedules(await api.deleteSchedule(id));

  /**
   * 渲染优先级标签
   * @param p 优先级
   * @returns JSX.Element
   */
  const renderPriorityBadge = (p: 'low'|'medium'|'high') => {
      const colors = {
          low: 'bg-blue-100 text-blue-600',
          medium: 'bg-yellow-100 text-yellow-600',
          high: 'bg-red-100 text-red-600'
      };
      return (
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${colors[p]}`}>
              {p}
          </span>
      );
  };

  /**
   * 检查指定日期是否有事件
   * @param day 日期
   * @returns boolean
   */
  const hasEventOnDate = (day: number) => {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      return schedules.some(s => s.date === dateStr) || todos.some(t => t.date === dateStr && !t.completed);
  };

  return (
    <div className="animate-slide-up max-w-7xl mx-auto pt-6 pb-20 relative px-4">
        {/* 背景装饰元素 */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[100px] animate-blob" style={{ backgroundColor: themeColor }} />
        </div>

        {/* 页面头部 */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm bg-white">
                <LayoutDashboard className="w-6 h-6" style={{ color: themeColor }} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-[#1D1D1F]">Dashboard</h1>
                <p className="text-gray-500 font-medium text-sm">Organize your life.</p>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
            {/* 日历侧边栏 */}
            <div className="lg:w-1/3 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-[#1D1D1F]">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-1">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
                    </div>
                </div>

                {/* 星期标题 */}
                <div className="grid grid-cols-7 mb-4 text-center">
                    {['S','M','T','W','T','F','S'].map((d,i) => (
                        <div key={i} className="text-xs font-bold text-gray-400 py-2">{d}</div>
                    ))}
                </div>

                {/* 日期网格 */}
                <div className="grid grid-cols-7 gap-y-2 flex-1 content-start">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`pad-${i}`} />)}
                    
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                        const isSelected = selectedDateStr === dateStr;
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;
                        const hasEvent = hasEventOnDate(day);

                        return (
                            <div key={day} className="flex flex-col items-center justify-center aspect-square relative cursor-pointer group" onClick={() => setSelectedDateStr(dateStr)}>
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200
                                    ${isSelected ? 'bg-black text-white shadow-lg scale-105' : 'text-gray-700 hover:bg-gray-100'}
                                    ${isToday && !isSelected ? 'text-[var(--theme-color)] font-bold bg-blue-50' : ''}
                                `}>
                                    {day}
                                </div>
                                {hasEvent && !isSelected && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--theme-color)]" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 详细信息区域 */}
            <div className="lg:w-2/3 flex flex-col gap-6">
                {/* 选定日期概览 */}
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[24px] border border-white/50 shadow-sm flex items-center justify-between">
                     <div>
                         <h3 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2">
                             {new Date(selectedDateStr).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
                         </h3>
                         <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Daily Overview</p>
                     </div>
                     <div className="flex gap-2">
                         <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">{daySchedules.length} Events</span>
                         <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{dayTodos.length} Tasks</span>
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    {/* 日程安排时间线 */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Calendar className="w-4 h-4" /> Timeline</h4>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {daySchedules.length === 0 ? (
                                /* 无日程安排时的占位符 */
                                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                    <Clock className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm">No events planned</p>
                                </div>
                            ) : (
                                /* 日程安排列表 */
                                daySchedules.map(item => (
                                    <div key={item.id} className="relative pl-6 pb-2 group">
                                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100 group-last:bottom-auto group-last:h-4" />
                                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-purple-400 ring-4 ring-white" />
                                        
                                        <div className="bg-gray-50/50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-md">{item.time}</span>
                                                <button onClick={() => deleteSchedule(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                            <div className="font-semibold text-gray-800 mt-1">{item.title}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 添加新日程安排表单 */}
                        <form onSubmit={addSchedule} className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                             <input type="time" value={newScheduleTime} onChange={e => setNewScheduleTime(e.target.value)} className="w-20 bg-gray-50 rounded-xl px-2 text-xs border-none" />
                             <input type="text" value={newScheduleTitle} onChange={e => setNewScheduleTitle(e.target.value)} placeholder="New Event..." className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm border-none focus:bg-white focus:ring-2 focus:ring-purple-100" />
                             <button type="submit" className="bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600"><Plus className="w-4 h-4" /></button>
                        </form>
                    </div>

                    {/* 待办事项列表 */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
                         <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Tasks</h4>
                         
                         <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {dayTodos.length === 0 ? (
                                /* 无待办事项时的占位符 */
                                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                    <CheckSquare className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm">No tasks for today</p>
                                </div>
                            ) : (
                                /* 待办事项列表 */
                                dayTodos.map(todo => (
                                    <div key={todo.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 group border border-transparent hover:border-gray-100 transition-all">
                                        <button onClick={() => toggleTodo(todo.id)} className={`shrink-0 ${todo.completed ? 'text-gray-300' : 'text-blue-500'}`}>
                                            {todo.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${todo.completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                                                {todo.text}
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                {renderPriorityBadge(todo.priority)}
                                            </div>
                                        </div>
                                        <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))
                            )}
                         </div>

                         {/* 添加新待办事项表单 */}
                         <form onSubmit={addTodo} className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                             <div className="flex gap-2">
                                 <select 
                                    value={newTodoPriority} 
                                    onChange={(e) => setNewTodoPriority(e.target.value as any)}
                                    className="bg-gray-50 rounded-xl px-2 py-2 text-xs border-none text-gray-600"
                                 >
                                     <option value="high">High</option>
                                     <option value="medium">Medium</option>
                                     <option value="low">Low</option>
                                 </select>
                                 <input type="text" value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="New Task..." className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm border-none focus:bg-white focus:ring-2 focus:ring-blue-100" />
                                 <button type="submit" className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600"><Plus className="w-4 h-4" /></button>
                             </div>
                         </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};