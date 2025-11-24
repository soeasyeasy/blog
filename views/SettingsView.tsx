/**
 * 设置视图组件
 * 提供网站各项配置的管理界面，包括通用设置、主题、个人资料、SEO 和友情链接
 */

import React, { useState } from "react";
// 导入图标组件
import { Save, Check, Trash2, Mail, Globe, MapPin, Briefcase, Building, Github, Twitter, Linkedin, Instagram, Sliders, Palette, Search as SearchIcon, Shield, UserCircle, Layout } from "lucide-react";
// 导入类型定义
import { SiteConfig, FriendLink, PRESET_THEMES } from "../types";

// 设置视图组件属性接口
interface SettingsViewProps {
  config: SiteConfig;               // 当前站点配置
  onSaveConfig: (c: SiteConfig) => void;  // 保存配置回调函数
}

// 设置视图组件
export const SettingsView = ({ config, onSaveConfig }: SettingsViewProps) => {
  // 状态管理：活动标签页和临时配置
  const [activeTab, setActiveTab] = useState<"general" | "theme" | "profile" | "seo" | "friends">("general");
  const [tempConfig, setTempConfig] = useState<SiteConfig>(config);
  // 新友情链接状态管理
  const [newFriendLink, setNewFriendLink] = useState<Partial<FriendLink>>({});

  /**
   * 处理保存配置
   */
  const handleSave = () => {
    onSaveConfig(tempConfig);
    alert("设置已保存");
  };

  /**
   * 处理添加友情链接
   */
  const handleAddFriendLink = () => {
    if (newFriendLink.name && newFriendLink.url) {
        // 构造新的友情链接对象
         const link: FriendLink = {
            id: Math.random().toString(36).substr(2, 9),
            name: newFriendLink.name,
            url: newFriendLink.url,
            avatar: newFriendLink.avatar,
            description: newFriendLink.description,
            category: newFriendLink.category || "默认分类"
          };
          // 更新临时配置
          setTempConfig({
            ...tempConfig,
            friendLinks: [...(tempConfig.friendLinks || []), link]
          });
          // 清空表单
          setNewFriendLink({});
    }
  };

  /**
   * 处理删除友情链接
   * @param id 友情链接 ID
   */
  const handleDeleteFriendLink = (id: string) => {
      setTempConfig({
          ...tempConfig,
          friendLinks: tempConfig.friendLinks?.filter(l => l.id !== id)
      });
  };

  // 侧边栏项组件
  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === id ? "bg-black text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pt-4 pb-20">
       <div className="flex flex-col md:flex-row gap-8">
           {/* 侧边栏 */}
           <div className="w-full md:w-64 shrink-0 space-y-1">
               <div className="px-4 mb-6">
                   <h2 className="text-2xl font-bold text-[#1D1D1F]">设置</h2>
                   <p className="text-xs text-gray-500 mt-1">System Preferences</p>
               </div>
               <SidebarItem id="general" label="通用设置" icon={Sliders} />
               <SidebarItem id="theme" label="外观与主题" icon={Palette} />
               <SidebarItem id="profile" label="个人资料" icon={UserCircle} />
               <SidebarItem id="seo" label="SEO 优化" icon={SearchIcon} />
               <SidebarItem id="friends" label="资源导航" icon={Layout} />
           </div>

           {/* 主内容区域 */}
           <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-200 p-8 sm:p-10 min-h-[600px] relative">
               
               {/* 保存按钮（浮动） */}
               <div className="absolute top-8 right-8 z-10">
                   <button 
                     onClick={handleSave}
                     className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                   >
                     <Save className="w-4 h-4" /> 保存更改
                   </button>
               </div>

               {/* --- 通用设置标签页 --- */}
               {activeTab === "general" && (
                   <div className="space-y-8 max-w-2xl animate-fade-in">
                       <div>
                           <h3 className="text-xl font-bold text-gray-900 mb-1">通用设置</h3>
                           <p className="text-sm text-gray-500">站点的基本信息与备案配置。</p>
                       </div>
                       
                       <div className="space-y-5">
                            {/* 网站名称 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">网站名称 (Site Name)</label>
                                <input type="text" value={tempConfig.siteName} onChange={e => setTempConfig({...tempConfig, siteName: e.target.value})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                {/* ICP 备案号 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ICP 备案号</label>
                                    <input type="text" value={tempConfig.icpNumber || ''} onChange={e => setTempConfig({...tempConfig, icpNumber: e.target.value})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" />
                                </div>
                                {/* SSO 登录 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">SSO 登录</label>
                                    <div className="flex items-center gap-4 h-[46px] px-2">
                                        <button onClick={() => setTempConfig({...tempConfig, sso: {...tempConfig.sso, enabled: !tempConfig.sso?.enabled} as any})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tempConfig.sso?.enabled ? 'bg-black' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tempConfig.sso?.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className="text-sm text-gray-600">{tempConfig.sso?.enabled ? '已启用' : '已禁用'}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Logo 图片 URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo 图片 URL</label>
                                <input type="text" value={tempConfig.logoUrl || ''} onChange={e => setTempConfig({...tempConfig, logoUrl: e.target.value})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" placeholder="https://..." />
                            </div>
                            {/* Hero 标题 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hero 标题</label>
                                <input type="text" value={tempConfig.heroTitle} onChange={e => setTempConfig({...tempConfig, heroTitle: e.target.value})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" />
                            </div>
                            {/* Hero 副标题 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hero 副标题</label>
                                <textarea rows={2} value={tempConfig.heroSubtitle} onChange={e => setTempConfig({...tempConfig, heroSubtitle: e.target.value})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" />
                            </div>
                            {/* Hero 背景图 URL */}
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hero 背景图 URL</label>
                                <input type="text" value={tempConfig.heroImage || ''} onChange={e => setTempConfig({...tempConfig, heroImage: e.target.value})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" />
                            </div>
                       </div>
                   </div>
               )}

               {/* --- 主题标签页 --- */}
               {activeTab === "theme" && (
                   <div className="space-y-8 max-w-2xl animate-fade-in">
                       <div>
                           <h3 className="text-xl font-bold text-gray-900 mb-1">外观与主题</h3>
                           <p className="text-sm text-gray-500">自定义全站的主色调。</p>
                       </div>
                       {/* 预设主题颜色网格 */}
                       <div className="grid grid-cols-4 gap-4">
                           {PRESET_THEMES.map(theme => (
                               <button
                                   key={theme.name}
                                   onClick={() => setTempConfig({...tempConfig, themeColor: theme.color})}
                                   className={`group relative w-full aspect-square rounded-2xl shadow-sm border border-gray-100 hover:scale-105 transition-all duration-300 ${tempConfig.themeColor?.toLowerCase() === theme.color.toLowerCase() ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                   style={{ backgroundColor: theme.color }}
                               >
                                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <span className="bg-black/20 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">{theme.name}</span>
                                   </div>
                                   {tempConfig.themeColor?.toLowerCase() === theme.color.toLowerCase() && (
                                       <Check className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
                                   )}
                               </button>
                           ))}
                       </div>
                       {/* 自定义颜色值 */}
                       <div className="pt-6 border-t border-gray-100">
                           <label className="block text-sm font-medium text-gray-700 mb-2">自定义颜色值 (Hex)</label>
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-lg border border-gray-200" style={{backgroundColor: tempConfig.themeColor}}></div>
                               <input type="text" value={tempConfig.themeColor} onChange={e => setTempConfig({...tempConfig, themeColor: e.target.value})} className="w-40 rounded-xl border-gray-200 focus:ring-black focus:border-black font-mono uppercase" />
                           </div>
                       </div>
                   </div>
               )}

               {/* --- 个人资料标签页 --- */}
               {activeTab === "profile" && (
                   <div className="space-y-8 animate-fade-in">
                       <div>
                           <h3 className="text-xl font-bold text-gray-900 mb-1">个人资料</h3>
                           <p className="text-sm text-gray-500">管理 Bento Grid 主页展示的个人信息。</p>
                       </div>
                       
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {/* 头像和姓名 */}
                           <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">基本信息</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                        <img src={tempConfig.profile.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    <input type="text" value={tempConfig.profile.avatar} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, avatar: e.target.value}})} className="flex-1 rounded-xl border-gray-200 text-sm" placeholder="Avatar URL" />
                                </div>
                                <input type="text" value={tempConfig.profile.name} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, name: e.target.value}})} className="w-full rounded-xl border-gray-200 text-sm" placeholder="Display Name" />
                                <textarea rows={3} value={tempConfig.profile.bio} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, bio: e.target.value}})} className="w-full rounded-xl border-gray-200 text-sm" placeholder="Bio" />
                           </div>

                           {/* 工作信息 */}
                           <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">职业信息</label>
                                <input type="text" value={tempConfig.profile.jobTitle || ''} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, jobTitle: e.target.value}})} className="w-full rounded-xl border-gray-200 text-sm" placeholder="Job Title" />
                                <input type="text" value={tempConfig.profile.company || ''} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, company: e.target.value}})} className="w-full rounded-xl border-gray-200 text-sm" placeholder="Company" />
                                {/* 可雇佣状态切换 */}
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                    <span className="text-sm text-gray-600">Open to Work</span>
                                    <button onClick={() => setTempConfig({...tempConfig, profile: {...tempConfig.profile, availableForHire: !tempConfig.profile.availableForHire}})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tempConfig.profile.availableForHire ? 'bg-green-500' : 'bg-gray-200'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tempConfig.profile.availableForHire ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                           </div>

                           {/* 社交网络 */}
                           <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">社交网络</label>
                                <div className="grid gap-3">
                                    <input type="text" value={tempConfig.profile.github || ''} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, github: e.target.value}})} className="rounded-xl border-gray-200 text-sm" placeholder="GitHub Username" />
                                    <input type="text" value={tempConfig.profile.twitter || ''} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, twitter: e.target.value}})} className="rounded-xl border-gray-200 text-sm" placeholder="Twitter Username" />
                                    <input type="text" value={tempConfig.profile.socials?.linkedin || ''} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, socials: {...tempConfig.profile.socials, linkedin: e.target.value}}})} className="rounded-xl border-gray-200 text-sm" placeholder="LinkedIn URL" />
                                    <input type="text" value={tempConfig.profile.socials?.instagram || ''} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, socials: {...tempConfig.profile.socials, instagram: e.target.value}}})} className="rounded-xl border-gray-200 text-sm" placeholder="Instagram URL" />
                                </div>
                           </div>

                           {/* 技能栈 - 改为文本域 */}
                           <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">技能栈</label>
                                <textarea 
                                  rows={4}
                                  value={tempConfig.profile.skills?.join("\n") || ''} 
                                  onChange={e => setTempConfig({
                                    ...tempConfig, 
                                    profile: {
                                      ...tempConfig.profile, 
                                      skills: e.target.value.split("\n").map(s => s.trim()).filter(s => s.length > 0)
                                    }
                                  })} 
                                  className="w-full rounded-xl border-gray-200 text-sm font-mono" 
                                  placeholder="每行一个技能，支持 Markdown 语法&#10;例如：&#10;React&#10;Node.js&#10;TypeScript"
                                />
                           </div>
                       </div>
                       
                       {/* README 内容 */}
                       <div className="pt-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">README 内容</label>
                            <textarea rows={6} value={tempConfig.profile.readme} onChange={e => setTempConfig({...tempConfig, profile: {...tempConfig.profile, readme: e.target.value}})} className="w-full font-mono text-sm rounded-xl border-gray-200" />
                       </div>
                   </div>
               )}

               {/* --- SEO 标签页 --- */}
               {activeTab === "seo" && (
                   <div className="space-y-8 max-w-2xl animate-fade-in">
                       <div>
                           <h3 className="text-xl font-bold text-gray-900 mb-1">SEO 优化</h3>
                           <p className="text-sm text-gray-500">配置 Meta 标签以提升搜索引擎排名。</p>
                       </div>
                        <div className="space-y-5">
                            {/* 网站标题 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">网站标题 Title</label>
                                <input type="text" value={tempConfig.seo.siteTitle || ''} onChange={e => setTempConfig({...tempConfig, seo: {...tempConfig.seo, siteTitle: e.target.value}})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" />
                            </div>
                            {/* 描述 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">描述 Description</label>
                                <textarea rows={3} value={tempConfig.seo.description || ''} onChange={e => setTempConfig({...tempConfig, seo: {...tempConfig.seo, description: e.target.value}})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" />
                            </div>
                            {/* 关键词 */}
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">关键词 Keywords</label>
                                <input type="text" value={tempConfig.seo.keywords?.join(", ") || ''} onChange={e => setTempConfig({...tempConfig, seo: {...tempConfig.seo, keywords: e.target.value.split(/[,，]/).map(s=>s.trim())}})} className="w-full rounded-xl border-gray-200 focus:ring-black focus:border-black py-3" />
                            </div>
                        </div>
                   </div>
               )}

               {/* --- 友情链接标签页 --- */}
               {activeTab === "friends" && (
                   <div className="space-y-8 animate-fade-in">
                        <div>
                           <h3 className="text-xl font-bold text-gray-900 mb-1">资源导航</h3>
                           <p className="text-sm text-gray-500">管理友链与推荐资源。</p>
                       </div>
                       
                       {/* 添加新资源表单 */}
                       <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                           <h4 className="text-sm font-bold text-gray-900 mb-4">添加新资源</h4>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                               <input type="text" placeholder="名称" value={newFriendLink.name || ''} onChange={e => setNewFriendLink({...newFriendLink, name: e.target.value})} className="rounded-lg border-gray-200 text-sm" />
                               <input type="text" placeholder="URL" value={newFriendLink.url || ''} onChange={e => setNewFriendLink({...newFriendLink, url: e.target.value})} className="rounded-lg border-gray-200 text-sm" />
                               <input type="text" placeholder="分类" value={newFriendLink.category || ''} onChange={e => setNewFriendLink({...newFriendLink, category: e.target.value})} className="rounded-lg border-gray-200 text-sm" />
                               <input type="text" placeholder="描述" value={newFriendLink.description || ''} onChange={e => setNewFriendLink({...newFriendLink, description: e.target.value})} className="rounded-lg border-gray-200 text-sm" />
                           </div>
                           <button onClick={handleAddFriendLink} className="w-full bg-white border border-gray-200 text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">添加</button>
                       </div>

                       {/* 友情链接列表 */}
                       <div className="space-y-2">
                            {tempConfig.friendLinks?.map(link => (
                                <div key={link.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                                            {link.avatar ? <img src={link.avatar} className="w-full h-full object-cover rounded-lg" /> : link.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{link.name} <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded ml-2 border border-gray-200">{link.category}</span></div>
                                            <div className="text-xs text-gray-400">{link.url}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteFriendLink(link.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                   </div>
               )}

           </div>
       </div>
    </div>
  );
};