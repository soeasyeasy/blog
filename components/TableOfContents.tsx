/**
 * 目录组件
 * 用于生成文章内容的目录导航
 */

import React, { useMemo } from "react";
// 导入工具函数
import { generateHeadingId } from "../lib/utils";

// 目录项接口定义
interface TocItem {
  id: string;      // 锚点 ID
  text: string;    // 标题文本
  level: number;   // 标题级别 (1, 2)
}

// 目录组件属性接口
export const TableOfContents = ({ content }: { content: string }) => {
  // 使用 useMemo 计算目录项，仅在内容变化时重新计算
  const headings = useMemo(() => {
    // 将内容按行分割
    const lines = content.split('\n');
    // 过滤出标题行并生成目录项
    return lines
      .filter(line => line.startsWith('# ') || line.startsWith('## '))  // 只处理一级和二级标题
      .map(line => {
        // 确定标题级别
        const level = line.startsWith('# ') ? 1 : 2;
        // 提取标题文本
        const text = line.replace(/^#+\s/, '');
        // 生成锚点 ID
        const id = generateHeadingId(text);
        return { id, text, level };
      });
  }, [content]);

  // 如果没有标题，则不渲染目录
  if (headings.length === 0) return null;

  return (
    // 桌面端固定侧边栏目录
    <nav className="hidden lg:block w-64 sticky top-32 self-start pl-8 border-l border-gray-100 ml-8">
      {/* 目录标题 */}
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">目录</h4>
      {/* 目录列表 */}
      <ul className="space-y-3">
        {headings.map((h, i) => (
          <li key={i} className={`${h.level === 2 ? 'pl-4' : ''}`}>
            {/* 目录项链接 */}
            <a 
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                // 平滑滚动到对应标题位置
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-gray-500 hover:text-[#0071e3] transition-colors block truncate"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};