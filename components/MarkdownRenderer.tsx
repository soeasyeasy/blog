import React, { useEffect, useRef, useState } from "react";
import { generateHeadingId } from "../lib/utils";
import { CheckSquare, Square, Copy, Check, Info, AlertTriangle, XCircle, Lightbulb } from "lucide-react";

// --- Types for Block Parser ---
type BlockType = 'paragraph' | 'heading' | 'code' | 'blockquote' | 'alert' | 'list' | 'table' | 'hr' | 'image';
type AlertType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';

interface Block {
  type: BlockType;
  content?: string;
  language?: string; // For code
  level?: number; // For headings
  items?: ListItem[]; // For lists
  ordered?: boolean; // For lists
  rows?: string[][]; // For tables
  headers?: string[]; // For tables
  alignments?: ('left' | 'center' | 'right')[]; // For tables
  alertType?: AlertType; // For alerts
  src?: string; // For images
  alt?: string; // For images
}

interface ListItem {
    content: string;
    checked?: boolean; // For task lists
    indent: number;
}

// --- Inline Parser ---
// Handles: **bold**, *italic*, ~~strike~~, `code`, [link](url), ==highlight==, <kbd>, http://auto-link
const parseInline = (text: string) => {
  if (!text) return null;

  // Split by regex patterns. Order matters!
  // 1. Code (`...`)
  // 2. Image (![...](...))
  // 3. Link ([...](...))
  // 4. Highlight (==...==)
  // 5. Bold (**...**)
  // 6. Italic (*...*)
  // 7. Strike (~~...~~)
  // 8. KBD (<kbd>...</kbd>)
  // 9. AutoLink (http...)
  const parts = text.split(/(`[^`]+`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|==.*?==|\*\*.*?\*\*|\*.*?\*|~~.*?~~|<kbd>.*?<\/kbd>|https?:\/\/[^\s]+)/g);

  return parts.map((part, i) => {
    // Inline Code
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-gray-100 text-pink-500 px-1.5 py-0.5 rounded text-sm font-mono mx-1 border border-gray-200/50">{part.slice(1, -1)}</code>;
    }
    // Image (Inline logic fallback, mostly handled by block parser usually)
    if (part.match(/^!\[(.*?)\]\((.*?)\)$/)) {
      const match = part.match(/^!\[(.*?)\]\((.*?)\)$/);
      return (
         <span key={i} className="inline-block my-2">
            <img src={match![2]} alt={match![1]} className="rounded-lg shadow-sm max-w-full h-auto align-middle" />
         </span>
      );
    }
    // Link
    if (part.match(/^\[(.*?)\]\((.*?)\)$/)) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      return <a key={i} href={match![2]} target="_blank" rel="noreferrer" className="text-[var(--theme-color)] hover:underline font-medium decoration-2 decoration-[var(--theme-color)]/30">{match![1]}</a>;
    }
    // Highlight
    if (part.startsWith('==') && part.endsWith('==')) {
        return <mark key={i}>{part.slice(2, -2)}</mark>;
    }
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#1D1D1F]">{part.slice(2, -2)}</strong>;
    }
    // Italic
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-gray-800">{part.slice(1, -1)}</em>;
    }
    // Strikethrough
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <del key={i} className="text-gray-400 decoration-gray-300">{part.slice(2, -2)}</del>;
    }
    // KBD
    if (part.startsWith('<kbd>') && part.endsWith('</kbd>')) {
        return <kbd key={i}>{part.slice(5, -6)}</kbd>;
    }
    // AutoLink
    if (part.match(/^https?:\/\//)) {
        return <a key={i} href={part} target="_blank" rel="noreferrer" className="text-[var(--theme-color)] hover:underline truncate max-w-xs inline-block align-bottom">{part}</a>;
    }

    return part;
  });
};

// --- Block Parser Implementation ---
const parseBlocks = (markdown: string): Block[] => {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let currentBlock: Block | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block Start/End
    if (line.startsWith('```')) {
      if (currentBlock && currentBlock.type === 'code') {
        blocks.push(currentBlock);
        currentBlock = null;
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'code',
          language: line.slice(3).trim(),
          content: ''
        };
      }
      continue;
    }
    if (currentBlock && currentBlock.type === 'code') {
      currentBlock.content += line + '\n';
      continue;
    }

    // 2. Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: 'hr' });
      currentBlock = null;
      continue;
    }

    // 3. Headings
    if (line.startsWith('#')) {
      if (currentBlock) blocks.push(currentBlock);
      const level = line.match(/^#+/)?.[0].length || 1;
      blocks.push({
        type: 'heading',
        level,
        content: line.replace(/^#+\s+/, '')
      });
      currentBlock = null;
      continue;
    }

    // 4. Blockquotes & Alerts
    if (line.startsWith('>')) {
        const content = line.replace(/^>\s?/, '');
        // Check for GitHub Alert syntax: > [!NOTE]
        const alertMatch = content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);

        if (alertMatch) {
             if (currentBlock) blocks.push(currentBlock);
             currentBlock = {
                 type: 'alert',
                 alertType: alertMatch[1] as AlertType,
                 content: content.replace(/^\[!.*?\]\s?/, '')
             };
        } else {
            if (currentBlock && (currentBlock.type === 'blockquote' || currentBlock.type === 'alert')) {
                currentBlock.content += '\n' + content;
            } else {
                if (currentBlock) blocks.push(currentBlock);
                currentBlock = {
                    type: 'blockquote',
                    content: content
                };
            }
        }
        continue;
    }

    // 5. Lists (Unordered & Ordered & Task)
    const isList = /^\s*(-|\+|\*|\d+\.)\s/.test(line);
    if (isList) {
      const indent = line.search(/\S/);
      const isTask = /^\s*[-+*]\s\[( |x)\]/.test(line);
      let content = line.replace(/^\s*(-|\+|\*|\d+\.)\s/, '');
      let checked = undefined;

      if (isTask) {
          checked = /^\s*[-+*]\s\[x\]/.test(line);
          content = line.replace(/^\s*[-+*]\s\[( |x)\]/, '');
      }

      const listItem: ListItem = { content, indent, checked };

      if (currentBlock && currentBlock.type === 'list') {
         currentBlock.items!.push(listItem);
      } else {
         if (currentBlock) blocks.push(currentBlock);
         currentBlock = {
           type: 'list',
           items: [listItem],
           ordered: /^\s*\d+\./.test(line)
         };
      }
      continue;
    }

    // 6. Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const row = line.split('|').slice(1, -1).map(s => s.trim());

        if (currentBlock && currentBlock.type === 'table') {
            // Check if this is the separator line: |---|---|
            if (row.every(cell => /^[ -:]+$/.test(cell))) {
                // Parse alignments
                currentBlock.alignments = row.map(cell => {
                    if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
                    if (cell.endsWith(':')) return 'right';
                    return 'left';
                });
            } else {
                currentBlock.rows!.push(row);
            }
        } else {
            if (currentBlock) blocks.push(currentBlock);
            currentBlock = {
                type: 'table',
                headers: row,
                rows: [],
                alignments: []
            };
        }
        continue;
    }

    // 7. Empty Lines
    if (trimmed === '') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // 8. Paragraphs
    if (currentBlock && currentBlock.type === 'paragraph') {
      currentBlock.content += '\n' + line;
    } else {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        type: 'paragraph',
        content: line
      };
    }
  }

  if (currentBlock) blocks.push(currentBlock);
  return blocks;
};


// --- Components ---

const CodeBlock = ({ content, language }: { content: string, language?: string }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if ((window as any).hljs && codeRef.current) {
            (window as any).hljs.highlightElement(codeRef.current);
        }
    }, [content]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-6 rounded-2xl overflow-hidden border border-gray-200 bg-[#0d1117] shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-700/50">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 lowercase">{language || 'text'}</span>
                    <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
            <pre className="p-5 overflow-x-auto text-sm leading-relaxed font-mono custom-scrollbar">
                <code ref={codeRef} className={`language-${language || 'plaintext'}`}>{content}</code>
            </pre>
        </div>
    );
};

const AlertBlock = ({ type, content }: { type: AlertType, content: string }) => {
    const styles = {
        NOTE: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        TIP: { icon: Lightbulb, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        IMPORTANT: { icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        WARNING: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        CAUTION: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    };

    const style = styles[type] || styles.NOTE;
    const Icon = style.icon;

    return (
        <div className={`my-6 rounded-xl p-4 border-l-4 ${style.border} ${style.bg} flex gap-3`}>
            <Icon className={`w-5 h-5 shrink-0 ${style.color} mt-0.5`} />
            <div className="text-sm text-gray-800 leading-relaxed">
                <strong className={`block text-xs font-bold ${style.color} mb-1`}>{type}</strong>
                {content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{parseInline(line)}</p>
                ))}
            </div>
        </div>
    );
};

const ListBlock = ({ items, ordered }: { items: ListItem[], ordered: boolean }) => {
    // Calculate base indent
    const baseIndent = items.length > 0 ? items[0].indent : 0;

    return (
        <div className="my-5 pl-1">
            {items.map((item, i) => {
                // Normalize indent relative to base
                const level = Math.floor((item.indent - baseIndent) / 2);
                const marginLeft = `${level * 1.5}rem`;

                if (item.checked !== undefined) {
                    return (
                        <div key={i} className="flex items-start gap-3 mb-2 group" style={{ marginLeft }}>
                            <span className={`mt-0.5 ${item.checked ? "text-[var(--theme-color)]" : "text-gray-300"}`}>
                                {item.checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </span>
                            <span className={`${item.checked ? "text-gray-400 line-through decoration-gray-300" : "text-gray-700"} leading-relaxed`}>
                                {parseInline(item.content)}
                            </span>
                        </div>
                    );
                }

                return (
                    <div key={i} className="flex items-start gap-2.5 mb-2 relative" style={{ marginLeft }}>
                        {ordered ? (
                            <span className="text-sm font-bold text-gray-400 min-w-[1.2rem] text-right tabular-nums mt-0.5">{i + 1}.</span>
                        ) : (
                            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[var(--theme-color)] shrink-0 opacity-60 ring-4 ring-[var(--theme-color)]/10" />
                        )}
                        <span className="leading-relaxed text-gray-700">{parseInline(item.content)}</span>
                    </div>
                );
            })}
        </div>
    );
};

export const MarkdownRenderer = ({ content }: { content: string }) => {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-2 text-[#1D1D1F] leading-relaxed font-normal break-words">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={index} className="text-[17px] leading-8 text-gray-700 mb-6">{parseInline(block.content!)}</p>;

          case 'heading':
            const Tag = `h${block.level}` as React.ElementType;
            const sizes = ['text-4xl', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base'];
            const margins = ['mt-16 mb-8', 'mt-14 mb-6', 'mt-10 mb-5', 'mt-8 mb-4', 'mt-6 mb-3', 'mt-4 mb-2'];
            return (
                <Tag
                    key={index}
                    id={generateHeadingId(block.content!)}
                    className={`font-bold text-[#1D1D1F] scroll-mt-32 ${sizes[block.level!-1]} ${margins[block.level!-1]} tracking-tight`}
                >
                    {parseInline(block.content!)}
                </Tag>
            );

          case 'code':
            return <CodeBlock key={index} content={block.content!} language={block.language} />;

          case 'blockquote':
            return (
                <blockquote key={index} className="border-l-4 border-[var(--theme-color)] pl-6 py-2 my-8 bg-gray-50/50 rounded-r-xl text-gray-600 italic leading-loose">
                    {block.content!.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>{parseInline(line)}</p>
                    ))}
                </blockquote>
            );

          case 'alert':
            return <AlertBlock key={index} type={block.alertType!} content={block.content!} />;

          case 'list':
            return <ListBlock key={index} items={block.items!} ordered={block.ordered!} />;

          case 'hr':
            return <hr key={index} className="my-12 border-t border-gray-100" />;

          case 'table':
            return (
                <div key={index} className="overflow-x-auto my-8 rounded-2xl border border-gray-200 shadow-sm bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80 backdrop-blur">
                            <tr>
                                {block.headers?.map((h, i) => {
                                    const align = block.alignments?.[i] || 'left';
                                    return (
                                        <th key={i} className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider md-align-${align}`}>
                                            {parseInline(h)}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {block.rows?.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                    {row.map((cell, j) => {
                                         const align = block.alignments?.[j] || 'left';
                                         return (
                                            <td key={j} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 md-align-${align}`}>
                                                {parseInline(cell)}
                                            </td>
                                         );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};