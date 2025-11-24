/**
 * 友情链接视图组件
 * 展示网站的友情链接和推荐资源，按分类组织
 */

import React, { useMemo } from "react";
// 导入图标组件
import { Link as LinkIcon, ExternalLink, ArrowUpRight, Hash } from "lucide-react";
// 导入类型定义
import { SiteConfig, FriendLink } from "../types";

// 友情链接视图组件属性接口
interface FriendLinksViewProps {
  config: SiteConfig;  // 站点配置（包含友情链接信息）
}

// 友情链接视图组件
export const FriendLinksView = ({ config }: FriendLinksViewProps) => {
  // 解构站点配置中的友情链接、友情消息和主题颜色
  const { friendLinks, friendsMessage, themeColor = "#0071e3" } = config;

  // 使用 useMemo 对链接按分类进行分组，仅在友情链接数组变化时重新计算
  const groupedLinks = useMemo(() => {
    const groups: Record<string, FriendLink[]> = {};
    const defaultCat = "其他资源";
    
    if (friendLinks) {
        friendLinks.forEach(link => {
            const cat = link.category || defaultCat;
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(link);
        });
    }
    return groups;
  }, [friendLinks]);

  // 获取并排序分类数组
  const sortedCategories = Object.keys(groupedLinks).sort();

  return (
    <div className="animate-slide-up max-w-7xl mx-auto pt-6 pb-20 relative">
       {/* 背景装饰元素 */}
       <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div 
                className="absolute top-[-10%] right-0 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[100px] animate-blob"
                style={{ backgroundColor: themeColor }} 
            />
       </div>

      {/* 页面头部 */}
      <div className="text-center mb-16 space-y-4 pt-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1D1D1F] tracking-tight">资源导航</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
           {friendsMessage || "发现优质工具、框架与设计灵感。"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4">
        {/* 侧边栏导航（Web 导航样式） */}
        <nav className="hidden lg:block w-64 shrink-0">
             <div className="sticky top-24 space-y-1">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">目录</h3>
                 {sortedCategories.map(cat => (
                     <a 
                        key={cat}
                        href={`#cat-${cat}`}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-black hover:shadow-sm transition-all"
                     >
                         {cat}
                         <span className="ml-2 text-xs text-gray-400 opacity-60">({groupedLinks[cat].length})</span>
                     </a>
                 ))}
             </div>
        </nav>

        {/* 内容区域 */}
        <div className="flex-1 space-y-16">
            {sortedCategories.length > 0 ? (
                sortedCategories.map(cat => (
                    <div key={cat} id={`cat-${cat}`} className="scroll-mt-24">
                        {/* 分类标题 */}
                        <h2 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2 mb-6">
                            <span className="w-1 h-6 rounded-full" style={{ backgroundColor: themeColor }}></span>
                            {cat}
                        </h2>
                        
                        {/* 链接网格 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {groupedLinks[cat].map(link => (
                                <a 
                                    key={link.id} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        {/* 链接图标或首字母 */}
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                            {link.avatar ? (
                                                <img src={link.avatar} alt={link.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Hash className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                        {/* 外链图标 */}
                                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--theme-color)] transition-colors" />
                                    </div>
                                    
                                    <div>
                                        {/* 链接名称 */}
                                        <h3 className="font-bold text-[#1D1D1F] mb-1 group-hover:text-[var(--theme-color)] transition-colors">{link.name}</h3>
                                        {/* 链接描述 */}
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                            {link.description || "暂无描述"}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                /* 无链接时的占位符 */
                <div className="text-center py-20 text-gray-400 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <p>暂无资源，请在后台添加。</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};