/**
 * 导航栏组件
 * BlogOS 应用的顶部导航栏，包含站点 Logo、导航链接和用户操作按钮
 */

import React, { useState } from "react";
// 导入图标组件
import { Command, BookOpen, PenTool, Users, User, ChevronRight, Home, Menu, X, Settings, LayoutDashboard, LogOut } from "lucide-react";
// 导入类型定义
import { ViewMode, SiteConfig } from "../types";

// 导航栏组件属性接口
interface NavbarProps {
  view: ViewMode;                    // 当前视图模式
  navigateTo: any;                   // 导航函数
  isAuthenticated: boolean;          // 用户认证状态
  categories: string[];              // 分类数组
  selectedCategory: string;          // 选中的分类
  onSelectCategory: (c: string) => void;  // 选择分类回调函数
  config: SiteConfig;                // 站点配置
  onUpdateTheme: (color: string) => void;  // 更新主题回调函数
  onLogout: () => void;              // 登出回调函数
}

// 导航栏组件
export const Navbar = ({ 
  view, 
  navigateTo, 
  isAuthenticated, 
  config,
  onUpdateTheme,
  onLogout
}: NavbarProps) => {
  // 状态管理：移动端菜单是否打开
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 处理导航函数
  const handleNav = (mode: ViewMode) => {
    navigateTo(mode);
    setIsMobileMenuOpen(false);
  };

  // 导航项组件
  const NavItem = ({ mode, label, icon: Icon }: { mode: ViewMode, label: string, icon?: any }) => (
    <button 
      onClick={() => handleNav(mode)}
      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
        view === mode 
          ? 'text-black bg-gray-100 shadow-sm' 
          : 'text-gray-500 hover:text-black hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon className={`w-4 h-4 ${view === mode ? 'text-[var(--theme-color)]' : 'text-gray-400'}`} />}
      {label}
    </button>
  );

  return (
    <>
      {/* 导航栏主体 */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo 区域 */}
          <div 
            className="flex items-center gap-2 cursor-pointer group shrink-0" 
            onClick={() => handleNav("home")}
          >
            {/* 自定义 Logo */}
            {config.logoUrl ? (
               <img 
                 src={config.logoUrl} 
                 alt={config.siteName} 
                 className="h-8 w-auto object-contain hover:opacity-80 transition-opacity" 
               />
            ) : (
              <>
                {/* 默认 Logo */}
                <div 
                  className="w-8 h-8 text-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundColor: config.themeColor || 'black' }}
                >
                  <Command className="w-4 h-4" />
                </div>
                {/* 站点名称（桌面端显示） */}
                <span className="font-semibold text-lg tracking-tight text-gray-900 hidden sm:block">{config.siteName}</span>
              </>
            )}
          </div>

          {/* 桌面端导航链接 */}
          <div className="hidden md:flex items-center gap-1">
              <NavItem mode="home" label="首页" icon={Home} />
              <NavItem mode="categories" label="阅读" icon={BookOpen} />
              <NavItem mode="memos" label="随手记" icon={PenTool} />
              <NavItem mode="friends" label="资源" icon={Users} />
              <NavItem mode="profile" label="关于" icon={User} />
              {isAuthenticated && (
                  <NavItem mode="dashboard" label="我的日程" icon={LayoutDashboard} />
              )}
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-3 text-sm font-medium text-gray-500 shrink-0">
            
            {/* 认证用户操作按钮 */}
            {isAuthenticated && (
                <>
                    {/* 设置按钮 */}
                    <button 
                    onClick={() => handleNav("settings")}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${view === "settings" ? "bg-gray-100 text-black" : "text-gray-500"}`}
                    title="设置"
                    >
                    <Settings className="w-4 h-4" />
                    </button>
                    
                    {/* 登出按钮 */}
                    <button 
                    onClick={onLogout}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    title="退出登录"
                    >
                    <LogOut className="w-4 h-4" />
                    </button>
                </>
            )}

            {/* 分隔线 */}
            <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            {/* 未认证用户操作按钮 */}
            {!isAuthenticated && (
                <button 
                onClick={() => handleNav("admin-login")}
                className={`hidden sm:flex items-center gap-1 hover:text-black transition-colors duration-200`}
                >
                登录
                <ChevronRight className="w-3 h-3" />
                </button>
            )}

            {/* 认证用户操作按钮 */}
            {isAuthenticated && (
                 <button 
                 onClick={() => handleNav("admin-dashboard")}
                 className={`hidden sm:flex items-center gap-1 hover:text-black transition-colors duration-200 ${view.startsWith("admin") ? "text-black" : ""}`}
               >
                 控制台
                 <ChevronRight className="w-3 h-3" />
               </button>
            )}
            
            {/* 移动端菜单切换按钮 */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端导航菜单 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-16 bg-white/95 backdrop-blur-xl animate-fade-in flex flex-col">
           <div className="p-4 space-y-2 flex-1 overflow-y-auto">
              {/* 首页链接 */}
              <button onClick={() => handleNav("home")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                  <Home className="w-5 h-5 text-gray-400" /> 首页
              </button>
              {/* 阅读链接 */}
              <button onClick={() => handleNav("categories")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                  <BookOpen className="w-5 h-5 text-gray-400" /> 阅读列表
              </button>
              {/* 随手记链接 */}
              <button onClick={() => handleNav("memos")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                  <PenTool className="w-5 h-5 text-gray-400" /> 随手记
              </button>
              {/* 资源链接 */}
              <button onClick={() => handleNav("friends")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                  <Users className="w-5 h-5 text-gray-400" /> 资源导航
              </button>
              {/* 关于链接 */}
              <button onClick={() => handleNav("profile")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                  <User className="w-5 h-5 text-gray-400" /> 关于我
              </button>
              {/* 认证用户：我的日程链接 */}
              {isAuthenticated && (
                  <button onClick={() => handleNav("dashboard")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                      <LayoutDashboard className="w-5 h-5 text-gray-400" /> 我的日程
                  </button>
              )}
              {/* 分隔线 */}
              <div className="border-t border-gray-100 my-4" />
              {/* 认证用户：设置和登出链接 */}
              {isAuthenticated && (
                  <>
                    <button onClick={() => handleNav("settings")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                        <Settings className="w-5 h-5 text-gray-400" /> 系统设置
                    </button>
                    <button onClick={() => {onLogout(); setIsMobileMenuOpen(false);}} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-red-50 text-left font-bold text-lg text-red-600">
                        <LogOut className="w-5 h-5" /> 退出登录
                    </button>
                  </>
              )}
              
              {/* 未认证用户：登录链接 */}
              {!isAuthenticated && (
                 <button onClick={() => handleNav("admin-login")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                    <ChevronRight className="w-5 h-5 text-gray-400" /> 管理员登录
                 </button>
              )}

              {/* 认证用户：控制台链接 */}
              {isAuthenticated && (
                 <button onClick={() => handleNav("admin-dashboard")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-gray-50 text-left font-bold text-lg text-gray-800">
                    <ChevronRight className="w-5 h-5 text-gray-400" /> 控制台
                 </button>
              )}
           </div>
        </div>
      )}
    </>
  );
};