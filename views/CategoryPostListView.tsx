/**
 * 分类文章列表视图组件
 * 展示按分类筛选的文章列表，支持搜索功能
 */

import React, { useState, useMemo } from "react";
// 导入图标组件
import { Search, ChevronRight, Folder, FileText, ChevronDown, Filter, X, Menu, SlidersHorizontal } from "lucide-react";
// 导入类型定义
import { Post, SiteConfig } from "../types";
// 导入工具函数
import { buildCategoryTree, CategoryNode, formatDate } from "../lib/utils";

// 分类文章列表视图组件属性接口
interface CategoryPostListViewProps {
  posts: Post[];                           // 文章数组
  config: SiteConfig;                      // 站点配置
  selectedCategory: string;                // 选中的分类
  onSelectCategory: (c: string) => void;   // 选择分类回调函数
  onRead: (id: string) => void;            // 阅读文章回调函数
  searchQuery: string;                     // 搜索关键词
  onSearchChange: (q: string) => void;     // 搜索关键词变化回调函数
}

// 分类项组件属性接口
interface CategoryItemProps {
  node: CategoryNode;                      // 分类节点
  level?: number;                          // 层级（用于缩进）
  selectedCategory: string;                // 选中的分类
  onSelect: (c: string) => void;           // 选择分类回调函数
}

// 分类项组件
const CategoryItem = ({ node, level = 0, selectedCategory, onSelect }: CategoryItemProps) => {
    // 状态管理：是否选中和是否展开
    const isSelected = selectedCategory === node.fullPath || selectedCategory.startsWith(node.fullPath + '/');
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children.length > 0;

    return (
        <div className="mb-0.5 select-none">
            <div className="flex items-center">
                <button 
                    onClick={() => onSelect(node.fullPath)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        selectedCategory === node.fullPath 
                        ? "bg-[var(--theme-color)] text-white font-medium shadow-md" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={{ paddingLeft: `${level * 12 + 12}px` }}
                >
                    {hasChildren ? (
                        <Folder className={`w-4 h-4 shrink-0 ${selectedCategory === node.fullPath ? "text-white" : "text-gray-400"}`} />
                    ) : (
                        <FileText className={`w-4 h-4 shrink-0 ${selectedCategory === node.fullPath ? "text-white" : "text-gray-400"}`} />
                    )}
                    <span className="truncate">{node.name}</span>
                </button>
                {hasChildren && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} 
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg ml-1"
                    >
                        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "" : "-rotate-90"}`} />
                    </button>
                )}
            </div>
            {hasChildren && expanded && (
                <div className="animate-slide-up">
                    {node.children.map(child => (
                        <CategoryItem key={child.fullPath} node={child} level={level + 1} selectedCategory={selectedCategory} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
};

// 分类文章列表视图组件
export const CategoryPostListView = ({ 
    posts, 
    config, 
    selectedCategory, 
    onSelectCategory, 
    onRead,
    searchQuery,
    onSearchChange
}: CategoryPostListViewProps) => {
  // 状态管理：可见文章数量和移动端菜单是否打开
  const [visibleCount, setVisibleCount] = useState(9);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 使用 useMemo 计算分类树，仅在文章数组变化时重新计算
  const categoryTree = useMemo(() => buildCategoryTree(["All", ...Array.from(new Set(posts.map(p => p.category)))]), [posts]);
  
  // 使用 useMemo 计算筛选后的文章，仅在相关依赖变化时重新计算
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory || post.category?.startsWith(selectedCategory + '/');
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  // 计算要显示的文章
  const displayPosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="animate-fade-in pt-4 lg:pt-8 pb-20 max-w-7xl mx-auto min-h-screen px-4 sm:px-6">
       
       {/* 移动端分类筛选按钮 */}
       <div className="lg:hidden mb-6 flex items-center justify-between">
           <h1 className="text-2xl font-bold text-[#1D1D1F]">阅读</h1>
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border ${isMobileMenuOpen ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}
           >
             <SlidersHorizontal className="w-4 h-4" />
             {selectedCategory === "All" ? "筛选分类" : selectedCategory.split('/').pop()}
           </button>
       </div>

       {/* 移动端筛选抽屉（可展开） */}
       {isMobileMenuOpen && (
           <div className="lg:hidden mb-8 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 animate-slide-up z-20 relative">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">选择分类</h3>
                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 bg-gray-100 rounded-full text-gray-500"><X className="w-4 h-4" /></button>
               </div>
               <div className="max-h-[60vh] overflow-y-auto">
                    <button 
                        onClick={() => { onSelectCategory("All"); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm mb-1 transition-colors ${selectedCategory === "All" ? "bg-black text-white font-medium" : "text-gray-600 bg-gray-50"}`}
                    >
                        <Folder className="w-4 h-4" /> 全部文章
                    </button>
                    {categoryTree.map(node => (
                        <CategoryItem key={node.fullPath} node={node} selectedCategory={selectedCategory} onSelect={(c) => { onSelectCategory(c); setIsMobileMenuOpen(false); }} />
                    ))}
               </div>
           </div>
       )}

       <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
           
           {/* 桌面端侧边栏 */}
           <aside className="hidden lg:block w-64 shrink-0 lg:h-[calc(100vh-120px)] lg:sticky lg:top-24">
               <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 h-full overflow-y-auto no-scrollbar">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-6">分类目录</h3>
                   <button 
                        onClick={() => onSelectCategory("All")}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm mb-1.5 transition-colors ${selectedCategory === "All" ? "bg-black text-white font-medium shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                   >
                       <Folder className="w-4 h-4" /> 全部文章
                   </button>
                   {categoryTree.map(node => (
                       <CategoryItem key={node.fullPath} node={node} selectedCategory={selectedCategory} onSelect={onSelectCategory} />
                   ))}

                   {/* 统计信息区域 */}
                   <div className="mt-10 pt-6 border-t border-gray-100 px-3">
                       <div className="text-xs text-gray-400 font-bold uppercase mb-3">归档统计</div>
                       <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <span className="text-gray-500">文章总数</span>
                           <span className="font-bold text-[#1D1D1F]">{posts.length}</span>
                       </div>
                   </div>
               </div>
           </aside>

           {/* 主内容区域 */}
           <div className="flex-1 min-w-0">
               {/* 搜索头部 */}
               <div className="mb-8 flex items-center gap-4 bg-white p-2.5 pl-4 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 bg-transparent border-none focus:ring-0 text-base placeholder-gray-400"
                            placeholder="搜索文章标题或内容..."
                        />
                        {searchQuery && (
                            <button onClick={() => onSearchChange("")} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {selectedCategory !== "All" && (
                        <div className="pr-2 flex items-center gap-2 hidden sm:flex">
                            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md border border-gray-200">
                                {selectedCategory}
                            </span>
                            <button onClick={() => onSelectCategory("All")} className="text-gray-400 hover:text-red-500 bg-gray-50 p-1 rounded-full"><X className="w-3 h-3" /></button>
                        </div>
                    )}
               </div>

               {/* 文章网格 */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                   {displayPosts.map(post => (
                       <div 
                         key={post.id} 
                         onClick={() => onRead(post.id)}
                         className="group bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                       >
                           <div className="h-52 sm:h-56 rounded-[20px] bg-gray-100 overflow-hidden mb-5 relative">
                               <img src={post.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} />
                               <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm">
                                   {post.category.split('/').pop()}
                               </div>
                           </div>
                           <div className="flex flex-col flex-1 px-1">
                               <div className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                                   {formatDate(post.date)}
                               </div>
                               <h3 className="text-xl font-bold text-[#1D1D1F] leading-tight mb-3 group-hover:text-[var(--theme-color)] transition-colors line-clamp-2">
                                   {post.title}
                               </h3>
                               <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-6 flex-1">
                                   {post.excerpt}
                               </p>
                               <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                   <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                           {post.author ? post.author[0] : 'A'}
                                       </div>
                                       <span className="text-xs font-medium text-gray-500">{post.author}</span>
                                   </div>
                                   <span className="text-xs font-bold text-[var(--theme-color)] flex items-center group-hover:translate-x-1 transition-transform">
                                       Read Article <ChevronRight className="w-3 h-3 ml-0.5" />
                                   </span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>

               {/* 无匹配文章时的提示 */}
               {displayPosts.length === 0 && (
                   <div className="text-center py-32 text-gray-400 bg-white rounded-[32px] border border-dashed border-gray-200 mt-4">
                       <Filter className="w-12 h-12 mx-auto mb-4 opacity-10" />
                       <p className="font-medium">没有找到相关文章</p>
                       <button onClick={() => {onSelectCategory("All"); onSearchChange("")}} className="text-sm text-[var(--theme-color)] mt-2 hover:underline">
                           清除筛选
                       </button>
                   </div>
               )}

               {/* 加载更多按钮 */}
               {filteredPosts.length > visibleCount && (
                   <div className="mt-12 text-center pb-8">
                       <button 
                         onClick={() => setVisibleCount(p => p + 9)}
                         className="px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
                       >
                           加载更多文章
                       </button>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};