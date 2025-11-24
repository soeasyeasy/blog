/**
 * 管理员仪表板视图组件
 * 提供文章和随手记的管理功能，包括创建、编辑、删除等操作
 */

import React, { useState, useRef, useMemo, useEffect } from "react";
// 导入图标组件
import { Download, Upload, Plus, User, Edit3, Trash2, Search, Filter, X, PenLine, Star } from "lucide-react";
// 导入类型定义
import { Post, SiteConfig, Memo } from "../types";
// 导入 API 工具
import { api } from "../lib/api";

// 管理员仪表板视图组件属性接口
interface AdminDashboardProps {
  posts: Post[];                           // 文章数组
  config: SiteConfig;                      // 站点配置
  onEdit: (p: Post) => void;               // 编辑文章回调函数
  onCreate: () => void;                    // 创建文章回调函数
  onDelete: (id: string) => void;          // 删除文章回调函数
  onExport: () => void;                    // 导出数据回调函数
  onImport: (e: any) => void;              // 导入数据回调函数
  onSaveConfig: (c: SiteConfig) => void;   // 保存配置回调函数
}

// 管理员仪表板视图组件
export const AdminDashboard = ({ 
  posts, 
  onEdit, 
  onCreate, 
  onDelete, 
  onExport, 
  onImport,
}: AdminDashboardProps) => {
  // 引用 DOM 元素
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 状态管理：活动标签页
  const [activeTab, setActiveTab] = useState<"posts" | "memos">("posts");

  // 随手记状态管理
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemoContent, setNewMemoContent] = useState("");
  const [newMemoImage, setNewMemoImage] = useState("");
  const [newMemoTags, setNewMemoTags] = useState("");

  // 文章筛选状态管理
  const [adminSearch, setAdminSearch] = useState("");
  const [adminCategory, setAdminCategory] = useState("All");

  // 当切换到随手记标签页时获取随手记数据
  useEffect(() => {
    if (activeTab === "memos") {
      api.getMemos().then(setMemos);
    }
  }, [activeTab]);

  // 使用 useMemo 计算唯一分类，仅在文章数组变化时重新计算
  const uniqueCategories = useMemo(() => {
    return ["All", ...Array.from(new Set(posts.map(p => p.category || "Uncategorized")))];
  }, [posts]);

  // 使用 useMemo 计算筛选后的文章，仅在相关依赖变化时重新计算
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(adminSearch.toLowerCase()) || 
        (post.author && post.author.toLowerCase().includes(adminSearch.toLowerCase()));
      const matchesCategory = adminCategory === "All" || post.category === adminCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, adminSearch, adminCategory]);

  /**
   * 处理添加随手记
   */
  const handleAddMemo = async () => {
    if (!newMemoContent.trim()) return;
    const images = newMemoImage ? [newMemoImage] : undefined;
    const tags = newMemoTags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    
    const updated = await api.addMemo(newMemoContent, images, tags.length > 0 ? tags : undefined);
    setMemos(updated);
    setNewMemoContent("");
    setNewMemoImage("");
    setNewMemoTags("");
  };

  /**
   * 处理删除随手记
   * @param id 随手记 ID
   */
  const handleDeleteMemo = async (id: string) => {
    if (window.confirm("Delete this memo?")) {
        const updated = await api.deleteMemo(id);
        setMemos(updated);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* 仪表板头部 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-[#1D1D1F]">控制台</h2>
          <p className="text-gray-500 mt-1">Content Management System</p>
        </div>
        
        {/* 标签页切换 */}
        <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm flex overflow-x-auto max-w-full no-scrollbar">
          <button 
            onClick={() => setActiveTab("posts")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'posts' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
          >
            文章管理
          </button>
           <button 
            onClick={() => setActiveTab("memos")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'memos' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
          >
            随手记管理
          </button>
        </div>
      </div>

      {/* 文章管理标签页 */}
      {activeTab === "posts" && (
        <div className="space-y-6 animate-slide-up">
          {/* 操作栏 */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
             <div className="flex items-center gap-3 flex-1">
                {/* 搜索框 */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="搜索标题或作者..." 
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-full bg-white border border-gray-200 text-sm focus:ring-black focus:border-black"
                  />
                  {adminSearch && (
                    <button onClick={() => setAdminSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                {/* 分类筛选 */}
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Filter className="w-3.5 h-3.5 text-gray-500" />
                   </div>
                   <select 
                     value={adminCategory}
                     onChange={(e) => setAdminCategory(e.target.value)}
                     className="pl-9 pr-8 py-2.5 rounded-full bg-white border border-gray-200 text-sm focus:ring-black focus:border-black appearance-none cursor-pointer min-w-[120px]"
                   >
                     {uniqueCategories.map(c => (
                       <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                </div>
             </div>

             {/* 操作按钮 */}
             <div className="flex flex-wrap gap-3">
                <button 
                  onClick={onExport}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">备份</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">导入</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={onImport}
                />

                <button 
                  onClick={onCreate}
                  className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  新建文章
                </button>
             </div>
          </div>

          {/* 文章列表 */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200/70 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 bg-gray-50/80 text-xs font-bold text-gray-400 uppercase tracking-widest backdrop-blur-sm">
              <div className="col-span-5">文章标题</div>
              <div className="col-span-2 hidden md:block">分类</div>
              <div className="col-span-2 hidden md:block">作者</div>
              <div className="col-span-7 md:col-span-3 text-right">操作</div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <div key={post.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-gray-50/50 transition-colors group">
                  <div className="col-span-5 pr-4">
                    <div className="flex items-center gap-2">
                        {post.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                        <div className="font-semibold text-[#1D1D1F] text-lg truncate">{post.title}</div>
                    </div>
                    <div className="text-sm text-gray-400 truncate mt-1 font-medium">{post.excerpt}</div>
                  </div>
                  <div className="col-span-2 hidden md:block">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase">{post.category}</span>
                  </div>
                  <div className="col-span-2 text-sm font-medium text-gray-600 hidden md:flex items-center gap-1">
                     <User className="w-3 h-3" /> {post.author}
                  </div>
                  <div className="col-span-7 md:col-span-3 flex justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => onEdit(post)}
                      className="p-2.5 text-gray-500 hover:text-[var(--theme-color)] hover:bg-blue-50 rounded-full transition-colors"
                      title="编辑"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(post.id)}
                      className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredPosts.length === 0 && (
                <div className="py-20 text-center text-gray-400">
                  <div className="mb-2">
                     {adminSearch || adminCategory !== "All" ? (
                        <Search className="w-10 h-10 mx-auto opacity-20" />
                     ) : (
                        <Edit3 className="w-10 h-10 mx-auto opacity-20" />
                     )}
                  </div>
                  {adminSearch || adminCategory !== "All" ? "没有找到符合条件的文章" : "暂无文章，点击“新建文章”开始创作。"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 随手记管理标签页 */}
      {activeTab === "memos" && (
        <div className="animate-slide-up max-w-2xl mx-auto space-y-8">
            {/* 发布新随笔表单 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-[#1D1D1F] mb-4 flex items-center gap-2">
                    <PenLine className="w-5 h-5" /> 发布新随笔
                </h3>
                <textarea 
                    value={newMemoContent}
                    onChange={(e) => setNewMemoContent(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl border-gray-100 p-4 text-sm focus:bg-white focus:ring-black focus:border-black mb-4 resize-none"
                    rows={4}
                    placeholder="写下此刻的想法..."
                />
                 <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newMemoImage}
                        onChange={(e) => setNewMemoImage(e.target.value)}
                        className="flex-1 bg-gray-50 rounded-lg border-gray-100 px-3 py-2 text-sm focus:bg-white focus:ring-black focus:border-black"
                        placeholder="图片 URL (可选)"
                    />
                    <input 
                        type="text" 
                        value={newMemoTags}
                        onChange={(e) => setNewMemoTags(e.target.value)}
                        className="flex-1 bg-gray-50 rounded-lg border-gray-100 px-3 py-2 text-sm focus:bg-white focus:ring-black focus:border-black"
                        placeholder="标签 (逗号分隔)"
                    />
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleAddMemo}
                        className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800"
                    >
                        发布
                    </button>
                </div>
            </div>

            {/* 随手记列表 */}
            <div className="space-y-4">
                {memos.map(memo => (
                    <div key={memo.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex gap-4">
                        <div className="flex-1">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-2">
                                {new Date(memo.date).toLocaleString()}
                            </div>
                            <div className="text-gray-800 whitespace-pre-wrap">{memo.content}</div>
                            {memo.tags && memo.tags.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                    {memo.tags.map(tag => (
                                        <span key={tag} className="text-xs text-[var(--theme-color)] bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {memo.images && memo.images.map((img, i) => (
                                <img key={i} src={img} className="mt-3 rounded-xl max-h-48 border border-gray-100" alt="Memo" />
                            ))}
                        </div>
                        <button 
                            onClick={() => handleDeleteMemo(memo.id)}
                            className="text-gray-400 hover:text-red-500 self-start"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};