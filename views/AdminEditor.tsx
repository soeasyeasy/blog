
import React, { useState } from "react";
import { Edit3, Columns, Eye, Sparkles, Save, Tag, LayoutGrid, User, Image as ImageIcon, Star } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { Post } from "../types";
import { generateId } from "../lib/utils";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

interface AdminEditorProps {
  initialPost: Post | null;
  onSave: (p: Post) => void;
  onCancel: () => void;
}

export const AdminEditor = ({ initialPost, onSave, onCancel }: AdminEditorProps) => {
  const [title, setTitle] = useState(initialPost?.title || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1000&auto=format&fit=crop");
  const [tags, setTags] = useState(initialPost?.tags.join(", ") || "");
  const [category, setCategory] = useState(initialPost?.category || "Tech");
  const [author, setAuthor] = useState(initialPost?.author || "Admin");
  const [featured, setFeatured] = useState(initialPost?.featured || false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split"); 

  const handleAIGenerate = async () => {
    if (!title) {
      alert("请先输入文章标题，AI 将根据标题为你创作。");
      return;
    }
    
    if(!process.env.API_KEY) {
        alert("API Key 未配置。");
        return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一位专业的科技博客作者。请为标题为 "${title}" 的文章生成内容。
      返回 JSON 格式: { "excerpt": "摘要", "content": "Markdown正文" }`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        if (data.excerpt) setExcerpt(data.excerpt);
        if (data.content) setContent(data.content);
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI 生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title || !content) {
      alert("标题和内容是必填项");
      return;
    }
    const post: Post = {
      id: initialPost?.id || generateId(),
      title,
      content,
      excerpt: excerpt || content.substring(0, 100) + "...",
      coverImage,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      category,
      author,
      featured,
      date: initialPost?.date || new Date().toISOString().split('T')[0]
    };
    onSave(post);
  };

  return (
    <div className="animate-slide-up max-w-7xl mx-auto pb-20">
      <div className="sticky top-20 z-30 bg-[#F5F5F7]/90 backdrop-blur-md py-6 flex items-center justify-between mb-6 border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-white"
          >
            取消
          </button>
          
          <div className="bg-white p-1 rounded-lg border border-gray-200 flex items-center shadow-sm">
             <button onClick={() => setViewMode("edit")} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${viewMode === "edit" ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}><Edit3 className="w-3 h-3" /> 编辑</button>
             <button onClick={() => setViewMode("split")} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${viewMode === "split" ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}><Columns className="w-3 h-3" /> 分栏</button>
             <button onClick={() => setViewMode("preview")} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${viewMode === "preview" ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}><Eye className="w-3 h-3" /> 预览</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setFeatured(!featured)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              featured 
                ? "bg-yellow-50 text-yellow-600 border-yellow-200 shadow-sm" 
                : "bg-white text-gray-400 border-transparent hover:bg-gray-50"
            }`}
          >
            <Star className={`w-4 h-4 ${featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
            {featured ? "已设为头条" : "设为头条"}
          </button>
          
          <button 
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              isGenerating 
                ? "bg-gray-100 text-gray-400 border-transparent" 
                : "bg-white text-purple-600 border-purple-100 hover:shadow-lg hover:shadow-purple-500/20"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "AI 思考中..." : "AI 写作"}
          </button>
          <button 
            onClick={handleSave}
            className="bg-[#0071e3] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#0077ed] transition-all shadow-lg hover:shadow-[#0071e3]/30 active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> 发布
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-200 p-6 sm:p-10 space-y-8">
        <div className="space-y-4 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl sm:text-5xl font-bold text-[#1D1D1F] placeholder-gray-200 border-none focus:ring-0 p-0 bg-transparent leading-tight"
            placeholder="输入文章标题..."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
                <Tag className="absolute left-0 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="标签 (逗号分隔)" className="w-full pl-6 py-2 text-sm font-medium text-gray-600 placeholder-gray-300 border-b border-gray-100 focus:border-[#0071e3] focus:ring-0 bg-transparent" />
            </div>
            <div className="relative">
                <LayoutGrid className="absolute left-0 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="分类 (如: Design)" className="w-full pl-6 py-2 text-sm font-medium text-gray-600 placeholder-gray-300 border-b border-gray-100 focus:border-[#0071e3] focus:ring-0 bg-transparent" />
            </div>
            <div className="relative">
                <User className="absolute left-0 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="作者名称" className="w-full pl-6 py-2 text-sm font-medium text-gray-600 placeholder-gray-300 border-b border-gray-100 focus:border-[#0071e3] focus:ring-0 bg-transparent" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto group relative aspect-[21/9] bg-gray-50 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#0071e3] transition-colors">
          {coverImage ? (
            <img src={coverImage} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <ImageIcon className="w-6 h-6 mb-2" />
               <span className="text-sm font-medium">封面图片预览</span>
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="w-full bg-white/90 backdrop-blur text-gray-800 border-none rounded-xl px-4 py-3 text-sm shadow-lg focus:ring-2 focus:ring-[#0071e3]" placeholder="输入图片 URL..." />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">摘要</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full bg-gray-50 hover:bg-gray-100 border-transparent rounded-2xl px-6 py-4 text-base text-gray-600 focus:bg-white focus:border-gray-200 focus:ring-0 transition-all resize-none leading-relaxed" placeholder="写一段简短的介绍..." />
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-100">
           <div className={`${viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)] min-h-[500px]' : ''}`}>
              {(viewMode === "edit" || viewMode === "split") && (
                <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`w-full bg-gray-50/30 hover:bg-gray-50/50 rounded-2xl p-6 border-transparent text-lg text-[#1D1D1F] leading-[1.8] focus:bg-white focus:ring-1 focus:ring-gray-200 resize-none placeholder-gray-300 font-mono ${viewMode === 'split' ? 'h-full' : 'min-h-[600px] max-w-4xl mx-auto block'}`} placeholder="Markdown 内容..." />
              )}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className={`bg-gray-50 rounded-2xl p-8 border border-gray-100 overflow-y-auto ${viewMode === 'split' ? 'h-full' : 'min-h-[600px] max-w-4xl mx-auto'}`}>
                   <div className="prose prose-lg prose-stone max-w-none">
                     <MarkdownRenderer content={content || "*暂无内容*"} />
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};