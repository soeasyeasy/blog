
import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Post, SiteConfig, ViewMode } from "./types";
import { api } from "./lib/api";
import { Navbar } from "./components/Navbar";
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

const App = () => {
  const [view, setView] = useState<ViewMode>("home");
  const [previousView, setPreviousView] = useState<ViewMode>("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Navigation State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [globalSearch, setGlobalSearch] = useState("");

  // Initial Load
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const [fetchedPosts, fetchedConfig] = await Promise.all([
        api.getPosts(),
        api.getConfig()
    ]);
    setPosts(fetchedPosts);
    setConfig(fetchedConfig);
  };

  // Theme & SEO
  useEffect(() => {
    if (config?.themeColor) document.documentElement.style.setProperty('--theme-color', config.themeColor);
  }, [config?.themeColor]);

  useEffect(() => {
    if (config?.seo) {
        document.title = config.seo.siteTitle || config.siteName;
    }
  }, [config?.seo, config?.siteName]);

  const handleUpdateTheme = async (color: string) => {
    if (!config) return;
    const newConfig = { ...config, themeColor: color };
    await api.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.map(p => p.category || "Uncategorized")))], [posts]);

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

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    navigateTo("categories");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("确定要删除这篇文章吗？")) {
      await api.deletePost(id);
      refreshData();
    }
  };

  const handleSavePost = async (post: Post) => {
    await api.addOrUpdatePost(post);
    refreshData();
    navigateTo("admin-dashboard");
  };

  const handleSaveConfig = async (newConfig: SiteConfig) => {
    await api.saveConfig(newConfig);
    refreshData();
  };

  const handleExport = async () => {
    const dataStr = await api.exportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `blog_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

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

  const handleLogout = () => {
      setIsAuthenticated(false);
      navigateTo("home");
  };

  if (!config) return <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-gray-400">Loading BlogOS...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[var(--theme-color)] selection:text-white">
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
      
      <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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

        {view === "profile" && <ProfileView config={config} />}
        {view === "friends" && <FriendLinksView config={config} />}
        {view === "memos" && <MemosView config={config} />}
        
        {view === "dashboard" && isAuthenticated && (
            <PersonalDashboard config={config} />
        )}
        
        {view === "post" && activePostId && (
          <PostDetail 
            post={posts.find(p => p.id === activePostId)!} 
            onBack={() => navigateTo(previousView)} 
          />
        )}

        {view === "admin-login" && (
          <AdminLogin onLogin={() => {
            setIsAuthenticated(true);
            navigateTo("admin-dashboard");
          }} />
        )}

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

        {view === "admin-editor" && isAuthenticated && (
          <AdminEditor 
            initialPost={editingPost} 
            onSave={handleSavePost} 
            onCancel={() => navigateTo("admin-dashboard")} 
          />
        )}

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

const root = createRoot(document.getElementById("root")!);
root.render(<React.StrictMode><App /></React.StrictMode>);
