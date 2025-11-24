/**
 * 个人资料视图组件
 * 展示用户的个人资料信息，包括基本信息、技能、社交媒体链接等
 */

import React from "react";
// 导入图标组件
import { MapPin, Mail, Github, Twitter, Link as LinkIcon, Briefcase, Building, Linkedin, Instagram, Youtube, Code, Globe, Send } from "lucide-react";
// 导入类型定义
import { SiteConfig } from "../types";
// 导入子组件
import { MarkdownRenderer } from "../components/MarkdownRenderer";

// 个人资料视图组件属性接口
interface ProfileViewProps {
  config: SiteConfig;  // 站点配置（包含个人资料信息）
}

// 个人资料视图组件
export const ProfileView = ({ config }: ProfileViewProps) => {
  // 解构站点配置中的个人资料和主题颜色
  const { profile, themeColor } = config;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pt-4 pb-20 px-2">
      {/* 动态背景光晕效果 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
         <div 
            className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] mix-blend-multiply animate-blob"
            style={{ backgroundColor: themeColor }} 
         />
         <div 
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-200 opacity-20 blur-[100px] mix-blend-multiply animate-blob animation-delay-2000" 
         />
      </div>

      {/* 个人资料网格布局 */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-5">
        
        {/* 1. 个人信息卡片（大左侧卡片） */}
        <div className="md:col-span-2 md:row-span-2 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-lg flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-[100px] opacity-50 -z-10" />
           
           <div className="space-y-6">
              {/* 头像和可雇佣状态 */}
              <div className="flex items-start justify-between">
                 <div className="w-24 h-24 rounded-full p-1 border-2 border-white shadow-sm bg-white">
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                 </div>
                 {profile.availableForHire && (
                    <div className="bg-[#E8FCD0] text-[#386A20] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 bg-[#499122] rounded-full animate-pulse"></span>
                        Open to Work
                    </div>
                 )}
              </div>
              {/* 姓名和职位 */}
              <div>
                  <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{profile.name}</h1>
                  <p className="text-lg text-gray-500 font-medium mt-1">{profile.jobTitle}</p>
              </div>
              {/* 个人简介 */}
              <p className="text-gray-600 leading-relaxed">
                  {profile.bio}
              </p>
           </div>
           
           {/* 联系和网站按钮 */}
           <div className="mt-8 pt-8 border-t border-gray-200/50 flex gap-3">
              {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex-1 bg-[#1D1D1F] text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md">
                      <Mail className="w-4 h-4" /> Contact Me
                  </a>
              )}
              {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="flex-1 bg-white text-[#1D1D1F] py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm border border-gray-200/50">
                      <Globe className="w-4 h-4" /> Website
                  </a>
              )}
           </div>
        </div>

        {/* 2. 统计信息/位置卡片 */}
        <div className="md:col-span-1 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-lg flex flex-col justify-center items-center text-center group hover:bg-white/80 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[var(--theme-color)] mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#1D1D1F]">Location</h3>
            <p className="text-sm text-gray-500 mt-1">{profile.location || "Earth"}</p>
        </div>

        {/* 3. 社交媒体矩阵卡片 */}
        <div className="md:col-span-1 bg-[#1D1D1F] text-white rounded-[32px] p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20" />
            <h3 className="font-bold text-lg z-10">Connect</h3>
            <div className="grid grid-cols-2 gap-3 mt-4 z-10">
                {profile.github && (
                    <a href={`https://${profile.github}`} target="_blank" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex items-center justify-center transition-colors"><Github className="w-5 h-5" /></a>
                )}
                {profile.twitter && (
                    <a href={`https://${profile.twitter}`} target="_blank" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex items-center justify-center transition-colors"><Twitter className="w-5 h-5" /></a>
                )}
                {profile.socials?.linkedin && (
                    <a href={profile.socials.linkedin} target="_blank" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex items-center justify-center transition-colors"><Linkedin className="w-5 h-5" /></a>
                )}
                {profile.socials?.instagram && (
                    <a href={profile.socials.instagram} target="_blank" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex items-center justify-center transition-colors"><Instagram className="w-5 h-5" /></a>
                )}
            </div>
        </div>

        {/* 4. 工作经验/当前职位卡片 */}
        <div className="md:col-span-2 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-lg flex items-center gap-6 hover:bg-white/80 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <Building className="w-8 h-8" />
            </div>
            <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Role</div>
                <div className="text-xl font-bold text-[#1D1D1F]">{profile.jobTitle || "Freelancer"}</div>
                <div className="text-gray-500">at {profile.company || "Self Employed"}</div>
            </div>
        </div>

        {/* 5. 技能云卡片 */}
        <div className="md:col-span-2 bg-gradient-to-br from-[var(--theme-color)] to-purple-600 rounded-[32px] p-8 shadow-lg text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                    <Code className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Skills & Tech</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {profile.skills?.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-sm font-medium border border-white/10 hover:bg-white/30 transition-colors cursor-default">
                            {skill}
                        </span>
                    )) || <span className="opacity-50">No skills listed</span>}
                </div>
            </div>
        </div>

        {/* 6. README/关于我卡片（全宽） */}
        <div className="md:col-span-4 bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
                 <div className="flex gap-1.5">
                     <div className="w-3 h-3 rounded-full bg-red-400" />
                     <div className="w-3 h-3 rounded-full bg-yellow-400" />
                     <div className="w-3 h-3 rounded-full bg-green-400" />
                 </div>
                 <span className="ml-4 text-xs font-mono text-gray-400">README.md</span>
            </div>
            <div className="p-8 sm:p-12 prose prose-stone max-w-none">
                <MarkdownRenderer content={profile.readme} />
            </div>
        </div>
      </div>
    </div>
  );
};