/**
 * 评论区组件
 * 用于显示和管理文章评论，支持嵌套回复功能
 */

import React, { useState } from "react";
// 导入图标组件
import { Send, CornerDownRight, MessageCircle } from "lucide-react";
// 导入类型定义
import { Comment } from "../types";
// 导入工具函数
import { formatDate } from "../lib/utils";
import { sanitizeHtml } from "../lib/validation";

// 评论区组件属性接口
interface CommentSectionProps {
  comments: Comment[];                          // 评论数组
  onAddComment: (content: string, author: string, parentId?: string) => void;  // 添加评论回调函数
}

// 单个评论项组件
const CommentItem = ({ 
  comment, 
  onReply, 
  isReplying, 
  onCancelReply, 
  onSubmitReply 
}: { 
  comment: Comment;                             // 评论对象
  onReply: (id: string) => void;                // 回复评论回调函数
  isReplying: boolean;                          // 是否正在回复
  onCancelReply: () => void;                    // 取消回复回调函数
  onSubmitReply: (content: string, author: string, parentId: string) => void;  // 提交回复回调函数
}) => {
  // 状态管理：回复内容和作者
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");

  // 处理回复表单提交
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 清理输入
    const cleanContent = sanitizeHtml(replyContent);
    const cleanAuthor = sanitizeHtml(replyAuthor) || "匿名用户";
    
    if (cleanContent.trim()) {
      onSubmitReply(cleanContent, cleanAuthor, comment.id);
      setReplyContent("");
      setReplyAuthor("");
    }
  };

  return (
    <div className="flex flex-col gap-3 animate-fade-in relative group">
       {/* 评论主体 */}
       <div className="flex gap-4">
          {/* 作者头像 */}
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0 uppercase border border-gray-100 shadow-sm">
              {comment.avatar ? <img src={comment.avatar} className="w-full h-full rounded-full object-cover" alt={comment.author} /> : comment.author.slice(0, 2)}
          </div>
          {/* 评论内容 */}
          <div className="flex-1 space-y-1">
              {/* 作者信息和日期 */}
              <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1D1D1F] text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-400">• {formatDate(comment.date)}</span>
              </div>
              {/* 评论文本 */}
              <div className="bg-gray-50 rounded-2xl rounded-tl-none px-5 py-3 text-gray-700 text-sm leading-relaxed shadow-sm border border-gray-100/50">
                  {comment.content}
              </div>
              
              {/* 回复按钮 */}
              <button 
                onClick={() => onReply(comment.id)} 
                className="text-xs font-semibold text-gray-400 hover:text-[var(--theme-color)] mt-1 ml-1 flex items-center gap-1 transition-colors"
              >
                 <MessageCircle className="w-3 h-3" /> 回复
              </button>
          </div>
       </div>

       {/* 回复表单 */}
       {isReplying && (
          <form onSubmit={handleReplySubmit} className="ml-14 mt-2 bg-white rounded-2xl p-3 border border-gray-200 shadow-md animate-fade-in">
              <div className="flex gap-2 mb-2">
                  {/* 作者姓名输入框 */}
                  <input 
                      type="text" 
                      placeholder="Name" 
                      value={replyAuthor}
                      onChange={e => setReplyAuthor(e.target.value)}
                      className="w-1/3 bg-gray-50 rounded-lg px-3 py-2 text-xs border-none focus:ring-1 focus:ring-black"
                  />
                  {/* 回复内容输入框 */}
                  <input 
                      type="text" 
                      autoFocus
                      placeholder={`Reply to ${comment.author}...`}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs border-none focus:ring-1 focus:ring-black"
                  />
              </div>
              {/* 表单操作按钮 */}
              <div className="flex justify-end gap-2">
                  <button type="button" onClick={onCancelReply} className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-black">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-black text-white rounded-lg text-xs font-bold">Reply</button>
              </div>
          </form>
       )}

       {/* 嵌套回复 */}
       {comment.replies && comment.replies.length > 0 && (
          <div className="ml-5 pl-5 border-l-2 border-gray-100 space-y-4 mt-2">
             {comment.replies.map(reply => (
                <CommentItem 
                   key={reply.id} 
                   comment={reply} 
                   onReply={onReply}
                   isReplying={false} // Only support 1 level deep replying for simplicity in UI state, or manage global active reply
                   onCancelReply={onCancelReply}
                   onSubmitReply={onSubmitReply}
                />
             ))}
          </div>
       )}
    </div>
  );
};

// 评论区主组件
export const CommentSection = ({ comments, onAddComment }: CommentSectionProps) => {
  // 状态管理：新评论内容、作者姓名和正在回复的评论 ID
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // 处理评论表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 清理输入
    const cleanContent = sanitizeHtml(newComment);
    const cleanAuthor = sanitizeHtml(authorName) || "匿名用户";
    
    if (cleanContent.trim()) {
      onAddComment(cleanContent, cleanAuthor);
      setNewComment("");
      setAuthorName("");
    }
  };

  // 处理回复提交
  const handleReplySubmit = (content: string, author: string, parentId: string) => {
      onAddComment(content, author, parentId);
      setReplyingToId(null);
  }

  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      {/* 评论标题 */}
      <h3 className="text-2xl font-bold text-[#1D1D1F] mb-8 flex items-center gap-2">
          评论 <span className="text-gray-400 text-lg font-normal">({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</span>
      </h3>
      
      {/* 评论列表 */}
      <div className="space-y-8 mb-12">
        {comments.length === 0 ? (
            // 无评论时的占位符
            <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">暂无评论，快来抢沙发。</p>
            </div>
        ) : (
            // 渲染评论列表
            comments.map(comment => (
                <CommentItem 
                    key={comment.id} 
                    comment={comment}
                    onReply={setReplyingToId}
                    isReplying={replyingToId === comment.id}
                    onCancelReply={() => setReplyingToId(null)}
                    onSubmitReply={handleReplySubmit}
                />
            ))
        )}
      </div>

      {/* 主评论输入框 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-2 shadow-lg border border-gray-100 flex items-start gap-2 focus-within:ring-2 focus-within:ring-[#0071e3]/20 transition-all relative z-10">
         <div className="flex-1">
             {/* 作者姓名输入框 */}
             <input 
                type="text" 
                placeholder="Your Name (Optional)" 
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-4 py-2 text-sm font-semibold text-gray-700 placeholder-gray-400 border-none focus:ring-0 bg-transparent"
             />
             <div className="h-px bg-gray-100 mx-4" />
             {/* 评论内容输入框 */}
             <textarea 
                placeholder="写下你的评论..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 bg-transparent resize-none"
                rows={2}
             />
         </div>
         {/* 提交按钮 */}
         <button 
           type="submit"
           disabled={!newComment.trim()}
           className="p-3 bg-black text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 mt-2 mr-2 shadow-md"
         >
             <Send className="w-4 h-4" />
         </button>
      </form>
    </div>
  );
};