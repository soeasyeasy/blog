
import React, { useMemo } from "react";
import { generateHeadingId } from "../lib/utils";

export const TableOfContents = ({ content }: { content: string }) => {
  const headings = useMemo(() => {
    const lines = content.split('\n');
    return lines
      .filter(line => line.startsWith('# ') || line.startsWith('## '))
      .map(line => {
        const level = line.startsWith('# ') ? 1 : 2;
        const text = line.replace(/^#+\s/, '');
        const id = generateHeadingId(text);
        return { id, text, level };
      });
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block w-64 sticky top-32 self-start pl-8 border-l border-gray-100 ml-8">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">目录</h4>
      <ul className="space-y-3">
        {headings.map((h, i) => (
          <li key={i} className={`${h.level === 2 ? 'pl-4' : ''}`}>
            <a 
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
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
