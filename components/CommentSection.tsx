
import React, { useState } from "react";
import { Send, CornerDownRight, MessageCircle } from "lucide-react";
import { Comment } from "../types";
import { formatDate } from "../lib/utils";

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string, author: string, parentId?: string) => void;
}

const CommentItem = ({ 
  comment, 
  onReply, 
  isReplying, 
  onCancelReply, 
  onSubmitReply 
}: { 
  comment: Comment;
  onReply: (id: string) => void;
  isReplying: boolean;
  onCancelReply: () => void;
  onSubmitReply: (content: string, author: string, parentId: string) => void;
}) => {
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    onSubmitReply(replyContent, replyAuthor || "Guest", comment.id);
    setReplyContent("");
    onCancelReply();
  };

  return (
    <div className="flex flex-col gap-3 animate-fade-in relative group">
       <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0 uppercase border border-gray-100 shadow-sm">
              {comment.avatar ? <img src={comment.avatar} className="w-full h-full rounded-full object-cover" alt={comment.author} /> : comment.author.slice(0, 2)}
          </div>
          <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1D1D1F] text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-400">• {formatDate(comment.date)}</span>
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-none px-5 py-3 text-gray-700 text-sm leading-relaxed shadow-sm border border-gray-100/50">
                  {comment.content}
              </div>
              
              <button 
                onClick={() => onReply(comment.id)} 
                className="text-xs font-semibold text-gray-400 hover:text-[var(--theme-color)] mt-1 ml-1 flex items-center gap-1 transition-colors"
              >
                 <MessageCircle className="w-3 h-3" /> 回复
              </button>
          </div>
       </div>

       {/* Reply Form */}
       {isReplying && (
          <form onSubmit={handleReplySubmit} className="ml-14 mt-2 bg-white rounded-2xl p-3 border border-gray-200 shadow-md animate-fade-in">
              <div className="flex gap-2 mb-2">
                  <input 
                      type="text" 
                      placeholder="Name" 
                      value={replyAuthor}
                      onChange={e => setReplyAuthor(e.target.value)}
                      className="w-1/3 bg-gray-50 rounded-lg px-3 py-2 text-xs border-none focus:ring-1 focus:ring-black"
                  />
                  <input 
                      type="text" 
                      autoFocus
                      placeholder={`Reply to ${comment.author}...`}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs border-none focus:ring-1 focus:ring-black"
                  />
              </div>
              <div className="flex justify-end gap-2">
                  <button type="button" onClick={onCancelReply} className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-black">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-black text-white rounded-lg text-xs font-bold">Reply</button>
              </div>
          </form>
       )}

       {/* Nested Replies */}
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

export const CommentSection = ({ comments, onAddComment }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment, authorName || "Guest");
    setNewComment("");
  };

  const handleReplySubmit = (content: string, author: string, parentId: string) => {
      onAddComment(content, author, parentId);
      setReplyingToId(null);
  }

  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      <h3 className="text-2xl font-bold text-[#1D1D1F] mb-8 flex items-center gap-2">
          评论 <span className="text-gray-400 text-lg font-normal">({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</span>
      </h3>
      
      {/* List */}
      <div className="space-y-8 mb-12">
        {comments.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">暂无评论，快来抢沙发。</p>
            </div>
        ) : (
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

      {/* Main Input */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-2 shadow-lg border border-gray-100 flex items-start gap-2 focus-within:ring-2 focus-within:ring-[#0071e3]/20 transition-all relative z-10">
         <div className="flex-1">
             <input 
                type="text" 
                placeholder="Your Name (Optional)" 
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-4 py-2 text-sm font-semibold text-gray-700 placeholder-gray-400 border-none focus:ring-0 bg-transparent"
             />
             <div className="h-px bg-gray-100 mx-4" />
             <textarea 
                placeholder="写下你的评论..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 bg-transparent resize-none"
                rows={2}
             />
         </div>
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
