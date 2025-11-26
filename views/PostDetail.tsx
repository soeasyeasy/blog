/**
 * 文章详情视图组件
 * 展示单篇文章的详细内容，包括标题、内容、评论等
 */

import React, { useState, useEffect } from "react";
// 导入图标组件
import { ArrowLeft, User, Heart, Share2, MessageCircle, Copy, Check, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
// 导入类型定义
import { Post } from "../types";
// 导入工具函数
import { formatDate } from "../lib/utils";
// 导入子组件
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { TableOfContents } from "../components/TableOfContents";
import { CommentSection } from "../components/CommentSection";
// 导入 API 工具
import { api } from "../lib/api";

// 文章详情视图组件属性接口
export const PostDetail = ({ post: initialPost, onBack }: { post: Post, onBack: () => void }) => {
  // 状态管理
  const [post, setPost] = useState(initialPost);  // 当前文章
  const [isLiked, setIsLiked] = useState(false);  // 是否已点赞
  const [copied, setCopied] = useState(false);    // 是否已复制链接
  const [showShareMenu, setShowShareMenu] = useState(false);  // 是否显示分享菜单
  const [isTocCollapsed, setIsTocCollapsed] = useState(false); // 目录是否收起

  // 当初始文章变化时更新状态
  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  /**
   * 处理点赞功能
   */
  const handleLike = async () => {
    const updated = await api.likePost(post.id);
    if (updated) {
      setPost(updated);
      setIsLiked(true);
      setTimeout(() => setIsLiked(false), 300);
    }
  };

  /**
   * 处理添加评论
   * @param content 评论内容
   * @param author 评论作者
   * @param parentId 父评论 ID（可选）
   */
  const handleAddComment = async (content: string, author: string, parentId?: string) => {
    const updated = await api.addComment(post.id, { content, author }, parentId);
    if (updated) setPost(updated);
  };

  /**
   * 处理复制链接
   */
  const handleCopyLink = () => {
      const url = window.location.href;
      if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
             setCopied(true);
             setTimeout(() => setCopied(false), 2000);
             setShowShareMenu(false);
          });
      } else {
          const textArea = document.createElement("textarea");
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          setShowShareMenu(false);
      }
  };

  /**
   * 分享到社交媒体
   * @param platform 社交平台
   */
  const shareToSocial = (platform: 'twitter' | 'linkedin') => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(post.title);
      let shareUrl = "";

      if (platform === 'twitter') {
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      } else if (platform === 'linkedin') {
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      }
      
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
  };

  /**
   * 切换目录收起/展开状态
   */
  const toggleTocCollapse = () => {
    setIsTocCollapsed(!isTocCollapsed);
  };

  return (
    <div className="animate-slide-up relative pb-24">
      {/* 返回按钮 */}
      <button 
        onClick={onBack} 
        className="group mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 hover:bg-white border border-transparent hover:border-gray-200 transition-all duration-300 text-sm font-medium text-gray-500 hover:text-[#1D1D1F]"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        返回
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* 文章内容区域 */}
        <article className={`flex-1 bg-white rounded-[40px] shadow-xl p-8 sm:p-16 border border-gray-100 min-w-0 relative overflow-hidden ${isTocCollapsed ? 'lg:max-w-[calc(100vw-120px)]' : ''}`}>
          <header className="mb-12 text-center space-y-6">
             {/* 分类和标签 */}
             <div className="flex items-center justify-center gap-3">
                <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wide">
                  {post.category}
                </span>
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
            </div>
            {/* 文章标题 */}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.1]">
              {post.title}
            </h1>
            {/* 作者和日期信息 */}
            <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author || "Unknown Author"}
              </div>
              <span>•</span>
              <time>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{post.likes || 0} Likes</span>
            </div>
          </header>

          {/* 封面图片 */}
          <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-sm mb-16 bg-gray-50">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* 文章内容 */}
          <div className="prose prose-lg prose-stone max-w-none">
             <MarkdownRenderer content={post.content} />
          </div>

          {/* 评论区 */}
          <CommentSection 
            comments={post.comments || []} 
            onAddComment={handleAddComment} 
          />
        </article>

        {/* 目录导航 */}
        <TableOfContents 
          content={post.content} 
          isCollapsed={isTocCollapsed}
          onToggleCollapse={toggleTocCollapse}
        />
      </div>

      {/* 固定底部操作栏 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-fade-in relative">
            {/* 点赞按钮 */}
            <button 
                onClick={handleLike}
                className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group"
                title="Like"
            >
                <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-red-500 text-red-500 scale-125' : 'group-hover:scale-110'}`} />
                <span className="text-sm font-bold">{post.likes || 0}</span>
            </button>
            <div className="w-px h-4 bg-gray-300" />
            {/* 评论按钮 */}
            <button 
                onClick={() => document.querySelector('textarea')?.focus()}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group"
                title="Comment"
            >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{post.comments?.length || 0}</span>
            </button>
            <div className="w-px h-4 bg-gray-300" />
            
            {/* 分享按钮 */}
            <div className="relative">
                <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
                    title="Share"
                >
                    <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                
                {showShareMenu && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-2 animate-slide-up flex flex-col gap-1">
                        {/* 复制链接按钮 */}
                        <button onClick={handleCopyLink} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100/80 rounded-xl text-sm font-medium text-gray-700 transition-colors w-full text-left">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <div className="h-px bg-gray-100 mx-2" />
                        {/* Twitter 分享按钮 */}
                        <button onClick={() => shareToSocial('twitter')} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100/80 rounded-xl text-sm font-medium text-gray-700 transition-colors w-full text-left">
                            <Twitter className="w-4 h-4 text-blue-400" />
                            Twitter
                        </button>
                        {/* LinkedIn 分享按钮 */}
                        <button onClick={() => shareToSocial('linkedin')} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100/80 rounded-xl text-sm font-medium text-gray-700 transition-colors w-full text-left">
                            <Linkedin className="w-4 h-4 text-blue-700" />
                            LinkedIn
                        </button>
                        {/* 箭头指示器 */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 backdrop-blur-xl border-b border-r border-gray-100 transform rotate-45"></div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};