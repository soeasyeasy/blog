import React, { useMemo } from "react";
import { generateHeadingId } from "../lib/utils";
import { ChevronLeft, Menu } from "lucide-react";

export const TableOfContents = ({ 
  content, 
  isCollapsed = false,
  onToggleCollapse 
}: { 
  content: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) => {
  const headings = useMemo(() => {
    const lines = content.split('\n');
    return lines
      .filter(line => /^#{1,3}\s/.test(line))
      .map(line => {
        const match = line.match(/^(#{1,3})\s/);
        const level = match ? match[1].length : 1;
        // Remove markdown syntax for the title display (simple strip)
        const rawText = line.replace(/^#+\s/, '');
        const text = rawText.replace(/(\*\*|__)(.*?)\1/g, '$2').replace(/(`)(.*?)\1/g, '$2');
        const id = generateHeadingId(rawText);
        return { id, text, level };
      });
  }, [content]);

  if (headings.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="hidden lg:block sticky top-32 self-start ml-8">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          title="展开目录"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <nav className="hidden lg:block w-64 sticky top-32 self-start pl-6 border-l border-gray-100 ml-8 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">目录</h4>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="收起目录"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <ul className="space-y-2.5">
        {headings.map((h, i) => (
          <li 
            key={i} 
            className={`
              relative
              ${h.level === 2 ? 'pl-3' : ''}
              ${h.level === 3 ? 'pl-6' : ''}
            `}
          >
            <a 
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`
                block text-sm transition-all duration-200 truncate pr-2
                ${h.level === 1 ? 'font-bold text-[#1D1D1F]' : 'text-gray-500 hover:text-[var(--theme-color)]'}
                ${h.level === 3 ? 'text-xs opacity-90' : ''}
              `}
              style={{ 
                transform: 'translateX(0)',
                transition: 'transform 0.2s ease'
              }}
            >
              <span className="inline-block w-full truncate" title={h.text}>
                {h.text}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};