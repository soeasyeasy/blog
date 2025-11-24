/**
 * Markdown 渲染器组件
 * 用于将 Markdown 格式的文本渲染为 HTML
 */

import React from "react";
// 导入工具函数
import { generateHeadingId } from "../lib/utils";

// Markdown 渲染器组件属性接口
export const MarkdownRenderer = ({ content }: { content: string }) => {
  // 将内容按行分割
  const lines = content.split('\n');
  // 代码块状态标志
  let inCodeBlock = false;

  /**
   * 解析行内元素（如粗体、链接等）
   * @param text 文本内容
   * @returns JSX.Element[]
   */
  const parseInline = (text: string) => {
    // 使用正则表达式分割文本，匹配粗体和链接
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      // 处理粗体文本
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-black">{part.slice(2, -2)}</strong>;
      }
      // 处理链接
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
             return <a key={i} href={match[2]} target="_blank" rel="noreferrer" className="text-[#0071e3] hover:underline font-medium">{match[1]}</a>;
        }
      }
      // 普通文本
      return part;
    });
  };

  return (
    <div className="space-y-4 text-[#1D1D1F]">
      {lines.map((line, index) => {
        // 处理代码块标记
        if (line.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return null;
        }
        // 处理代码块内容
        if (inCodeBlock) {
          return (
            <div key={index} className="bg-[#1d1d1f] text-white font-mono text-sm px-4 py-2 first:pt-4 last:pb-4 rounded-lg overflow-x-auto my-4 shadow-sm">
              {line}
            </div>
          );
        }
        // 处理一级标题
        if (line.startsWith('# ')) {
          const text = line.replace('# ', '');
          return <h1 key={index} id={generateHeadingId(text)} className="text-3xl font-bold mt-10 mb-6 text-[#1D1D1F] scroll-mt-24">{parseInline(text)}</h1>;
        }
        // 处理二级标题
        if (line.startsWith('## ')) {
          const text = line.replace('## ', '');
          return <h2 key={index} id={generateHeadingId(text)} className="text-2xl font-semibold mt-8 mb-4 text-[#1D1D1F] scroll-mt-24">{parseInline(text)}</h2>;
        }
        // 处理三级标题
        if (line.startsWith('### ')) {
          const text = line.replace('### ', '');
          return <h3 key={index} id={generateHeadingId(text)} className="text-xl font-medium mt-6 mb-3 text-[#1D1D1F] scroll-mt-24">{parseInline(text)}</h3>;
        }
        // 处理引用块
        if (line.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-[#0071e3] pl-4 py-2 my-6 text-gray-600 italic bg-gray-50 rounded-r-lg">
              {parseInline(line.replace('> ', ''))}
            </blockquote>
          );
        }
        // 处理列表项
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const indentLevel = line.search(/\S/);  // 获取缩进级别
          const content = trimmedLine.substring(2);  // 获取列表项内容
          return (
            <div key={index} className={`flex items-start gap-2 mb-2 ${indentLevel > 0 ? 'ml-8' : 'ml-4'}`}>
              <span className="text-[#0071e3] mt-1.5">•</span>
              <span className="leading-relaxed">{parseInline(content)}</span>
            </div>
          );
        }
        // 处理图片
        const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          return (
            <figure key={index} className="my-8">
              <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full rounded-2xl shadow-md" />
              {imgMatch[1] && <figcaption className="text-center text-sm text-gray-500 mt-2">{imgMatch[1]}</figcaption>}
            </figure>
          );
        }
        // 处理空行
        if (line.trim() === '') return <br key={index} />;
        // 处理普通段落
        return <p key={index} className="text-lg md:text-xl font-light tracking-wide text-[#333] leading-[1.8]">{parseInline(line)}</p>;
      })}
    </div>
  );
};