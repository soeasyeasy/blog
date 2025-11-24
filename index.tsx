/**
 * 主应用入口文件
 * BlogOS 前端主应用，使用 React 构建
 * 包含路由管理、状态管理和所有视图组件的集成
 */

import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
// 导入类型定义
import { Post, SiteConfig, ViewMode } from "./types";
// 导入 API 工具
import { api } from "./lib/api";
// 导入导航栏组件
import { Navbar } from "./components/Navbar";
// 导入各个视图组件
import { IndexView } from "./views/IndexView";
import { CategoryPostListView } from "./views/CategoryPostListView";
import { PostDetail } from "./views/PostDetail";
import { AdminLogin } from "./views/AdminLogin";
import { AdminDashboard } from "./views/AdminDashboard";
import { AdminEditor } from "./views/AdminEditor";
import { ProfileView } from "./views/ProfileView";
import { FriendLinksView } from "./views/FriendLinksView";
import { MemosView } from "./views/MemosView";
import { SettingsView } from "./views/SettingsView";
import { PersonalDashboard } from "./views/PersonalDashboard";

// 主应用组件
const App = () => {
  // 状态管理：当前视图模式
  const [view, setView] = useState<ViewMode>("home");
  // 状态管理：前一个视图模式（用于返回）
  const [previousView, setPreviousView] = useState<ViewMode>("home");
  // 状态管理：文章列表
  const [posts, setPosts] = useState<Post[]>([]);
  // 状态管理：站点配置
  const [config, setConfig] = useState<SiteConfig | null>(null);
  // 状态管理：当前激活的文章 ID
  const [activePostId, setActivePostId] = useState<string | null>(null);
  // 状态管理：用户认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 状态管理：正在编辑的文章
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // 导航状态管理：选中的分类
  const [selectedCategory, setSelectedCategory] = useState("All");
  // 导航状态管理：全局搜索关键词
  const [globalSearch, setGlobalSearch] = useState("");

  // 初始数据加载：获取文章和配置信息
  useEffect(() => {
    refreshData();
  }, []);

  // 刷新数据函数：获取最新的文章和配置
  const refreshData = async () => {
    const [fetchedPosts, fetchedConfig] = await Promise.all([
        api.getPosts(),
        api.getConfig()
    ]);
    setPosts(fetchedPosts);
    setConfig(fetchedConfig);
  };

  // 主题颜色更新：监听配置变化并更新主题色
  useEffect(() => {
    if (config?.themeColor) document.documentElement.style.setProperty('--theme-color', config.themeColor);
  }, [config?.themeColor]);

  // SEO 设置：监听配置变化并更新页面标题
  useEffect(() => {
    if (config?.seo) {
        document.title = config.seo.siteTitle || config.siteName;
    }
  }, [config?.seo, config?.siteName]);

  // 更新主题颜色处理函数
  const handleUpdateTheme = async (color: string) => {
    if (!config) return;
    const newConfig = { ...config, themeColor: color };
    await api.saveConfig(newConfig);
    setConfig(newConfig);
  };

  // 计算分类列表：从文章中提取所有唯一分类
  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.map(p => p.category || "Uncategorized")))], [posts]);

  // 导航函数：切换视图
  const navigateTo = (targetView: ViewMode, id?: string) => {
    if (targetView === "post") {
        if (view === "home" || view === "categories") {
            setPreviousView(view);
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id) setActivePostId(id);
    setView(targetView);
  };

  // 全局搜索处理函数
  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    navigateTo("categories");
  };

  // 删除文章处理函数
  const handleDelete = async (id: string) => {
    if (window.confirm("确定要删除这篇文章吗？")) {
      await api.deletePost(id);
      refreshData();
    }
  };

  // 保存文章处理函数
  const handleSavePost = async (post: Post) => {
    await api.addOrUpdatePost(post);
    refreshData();
    navigateTo("admin-dashboard");
  };

  // 保存配置处理函数
  const handleSaveConfig = async (newConfig: SiteConfig) => {
    await api.saveConfig(newConfig);
    refreshData();
  };

  // 数据导出处理函数
  const handleExport = async () => {
    const dataStr = await api.exportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `blog_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  // 数据导入处理函数
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (await api.importData(event.target?.result as string)) {
        alert("导入成功！");
        refreshData();
      } else {
        alert("文件格式错误");
      }
    };
    reader.readAsText(file);
  };

  // 用户登出处理函数
  const handleLogout = () => {
      setIsAuthenticated(false);
      navigateTo("home");
  };

  // 加载状态：配置未加载完成时显示加载界面
  if (!config) return <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-gray-400">Loading BlogOS...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[var(--theme-color)] selection:text-white">
      {/* 导航栏组件 */}
      <Navbar 
        view={view} 
        navigateTo={navigateTo} 
        isAuthenticated={isAuthenticated} 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(c) => {
            setSelectedCategory(c);
            navigateTo("categories");
        }}
        config={config}
        onUpdateTheme={handleUpdateTheme}
        onLogout={handleLogout}
      />
      
      {/* 主内容区域 */}
      <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* 首页视图 */}
        {view === "home" && (
          <IndexView 
            posts={posts} 
            onRead={(id) => navigateTo("post", id)} 
            config={config}
            onUpdateTheme={handleUpdateTheme}
            onSearch={handleGlobalSearch}
            onViewAll={() => navigateTo("categories")}
            isAuthenticated={isAuthenticated}
          />
        )}

        {/* 分类文章列表视图 */}
        {view === "categories" && (
          <CategoryPostListView 
            posts={posts}
            config={config}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onRead={(id) => navigateTo("post", id)}
            searchQuery={globalSearch}
            onSearchChange={setGlobalSearch}
          />
        )}

        {/* 个人资料视图 */}
        {view === "profile" && <ProfileView config={config} />}
        {/* 友情链接视图 */}
        {view === "friends" && <FriendLinksView config={config} />}
        {/* 随手记视图 */}
        {view === "memos" && <MemosView config={config} />}
        
        {/* 个人仪表板视图 */}
        {view === "dashboard" && isAuthenticated && (
            <PersonalDashboard config={config} />
        )}
        
        {/* 文章详情视图 */}
        {view === "post" && activePostId && (
          <PostDetail 
            post={posts.find(p => p.id === activePostId)!} 
            onBack={() => navigateTo(previousView)} 
          />
        )}

        {/* 管理员登录视图 */}
        {view === "admin-login" && (
          <AdminLogin onLogin={() => {
            setIsAuthenticated(true);
            navigateTo("admin-dashboard");
          }} />
        )}

        {/* 管理员仪表板视图 */}
        {view === "admin-dashboard" && isAuthenticated && (
          <AdminDashboard 
            posts={posts} 
            config={config}
            onEdit={(post) => {
              setEditingPost(post);
              navigateTo("admin-editor");
            }}
            onCreate={() => {
              setEditingPost(null);
              navigateTo("admin-editor");
            }}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onSaveConfig={handleSaveConfig}
          />
        )}

        {/* 文章编辑器视图 */}
        {view === "admin-editor" && isAuthenticated && (
          <AdminEditor 
            initialPost={editingPost} 
            onSave={handleSavePost} 
            onCancel={() => navigateTo("admin-dashboard")} 
          />
        )}

        {/* 设置视图 */}
        {view === "settings" && isAuthenticated && (
            <SettingsView 
                config={config} 
                onSaveConfig={handleSaveConfig}
            />
        )}
      </main>
    </div>
  );
};

// 渲染应用到 DOM
const root = createRoot(document.getElementById("root")!);
root.render(<React.StrictMode><App /></React.StrictMode>);