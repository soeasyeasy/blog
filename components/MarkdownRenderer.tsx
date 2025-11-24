
import React from "react";
import { generateHeadingId } from "../lib/utils";

export const MarkdownRenderer = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  let inCodeBlock = false;

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-black">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
             return <a key={i} href={match[2]} target="_blank" rel="noreferrer" className="text-[#0071e3] hover:underline font-medium">{match[1]}</a>;
        }
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 text-[#1D1D1F]">
      {lines.map((line, index) => {
        if (line.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return null;
        }
        if (inCodeBlock) {
          return (
            <div key={index} className="bg-[#1d1d1f] text-white font-mono text-sm px-4 py-2 first:pt-4 last:pb-4 rounded-lg overflow-x-auto my-4 shadow-sm">
              {line}
            </div>
          );
        }
        if (line.startsWith('# ')) {
          const text = line.replace('# ', '');
          return <h1 key={index} id={generateHeadingId(text)} className="text-3xl font-bold mt-10 mb-6 text-[#1D1D1F] scroll-mt-24">{parseInline(text)}</h1>;
        }
        if (line.startsWith('## ')) {
          const text = line.replace('## ', '');
          return <h2 key={index} id={generateHeadingId(text)} className="text-2xl font-semibold mt-8 mb-4 text-[#1D1D1F] scroll-mt-24">{parseInline(text)}</h2>;
        }
        if (line.startsWith('### ')) {
          const text = line.replace('### ', '');
          return <h3 key={index} id={generateHeadingId(text)} className="text-xl font-medium mt-6 mb-3 text-[#1D1D1F] scroll-mt-24">{parseInline(text)}</h3>;
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-[#0071e3] pl-4 py-2 my-6 text-gray-600 italic bg-gray-50 rounded-r-lg">
              {parseInline(line.replace('> ', ''))}
            </blockquote>
          );
        }
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const indentLevel = line.search(/\S/);
          const content = trimmedLine.substring(2);
          return (
            <div key={index} className={`flex items-start gap-2 mb-2 ${indentLevel > 0 ? 'ml-8' : 'ml-4'}`}>
              <span className="text-[#0071e3] mt-1.5">•</span>
              <span className="leading-relaxed">{parseInline(content)}</span>
            </div>
          );
        }
        const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          return (
            <figure key={index} className="my-8">
              <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full rounded-2xl shadow-md" />
              {imgMatch[1] && <figcaption className="text-center text-sm text-gray-500 mt-2">{imgMatch[1]}</figcaption>}
            </figure>
          );
        }
        if (line.trim() === '') return <br key={index} />;
        return <p key={index} className="text-lg md:text-xl font-light tracking-wide text-[#333] leading-[1.8]">{parseInline(line)}</p>;
      })}
    </div>
  );
};
