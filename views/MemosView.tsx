
import React, { useEffect, useState } from "react";
import { PenLine, Calendar } from "lucide-react";
import { Memo, SiteConfig } from "../types";
import { api } from "../lib/api";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

interface MemosViewProps {
    config: SiteConfig;
}

export const MemosView = ({ config }: MemosViewProps) => {
    const [memos, setMemos] = useState<Memo[]>([]);
    const { themeColor = "#0071e3" } = config;

    useEffect(() => {
        api.getMemos().then(setMemos);
    }, []);

    const groupedMemos = memos.reduce((groups, memo) => {
        const date = new Date(memo.date);
        const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(memo);
        return groups;
    }, {} as Record<string, Memo[]>);

    return (
        <div className="animate-slide-up max-w-4xl mx-auto pt-10 pb-20 relative px-4">
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div 
                    className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-[80px] mix-blend-multiply animate-blob"
                    style={{ backgroundColor: themeColor }} 
                />
                <div 
                    className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 blur-[80px] mix-blend-multiply animate-blob animation-delay-4000"
                    style={{ backgroundColor: themeColor }} 
                />
            </div>

            <div className="flex items-center gap-4 mb-12">
                <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-sm"
                    style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                >
                    <PenLine className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#1D1D1F]">灵感胶囊</h1>
                    <p className="text-gray-500 font-medium">捕捉稍纵即逝的想法与瞬间。</p>
                </div>
            </div>

            <div className="relative border-l-2 border-gray-100/80 ml-4 sm:ml-8 space-y-12">
                {Object.keys(groupedMemos).length > 0 ? (
                    Object.entries(groupedMemos).map(([dateLabel, groupMemos]) => (
                        <div key={dateLabel} className="pl-6 sm:pl-8 relative">
                            <div 
                                className="absolute -left-[31px] sm:-left-[39px] top-0 bg-white border-4 w-5 h-5 rounded-full z-10" 
                                style={{ borderColor: `${themeColor}40` }}
                            />
                            
                            <h3 className="text-lg font-bold text-gray-400 mb-6 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> {dateLabel}
                            </h3>

                            <div className="grid gap-6">
                                {(groupMemos as Memo[]).map((memo) => {
                                    const memoDate = new Date(memo.date);
                                    const timeStr = `${memoDate.getHours().toString().padStart(2, '0')}:${memoDate.getMinutes().toString().padStart(2, '0')}`;
                                    
                                    return (
                                        <div 
                                            key={memo.id} 
                                            className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                                            style={{ boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.02)` }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                 <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-center text-xs font-bold text-gray-400 bg-gray-50/80 px-2.5 py-1.5 rounded-xl border border-gray-100">
                                                        <span className="text-lg text-[#1D1D1F] leading-none mb-0.5">{memoDate.getDate()}</span>
                                                        <span className="uppercase text-[10px] tracking-wider">{memoDate.toLocaleString('default', { month: 'short' })}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-400 font-medium">{timeStr}</div>
                                                 </div>
                                                 {memo.tags && memo.tags.length > 0 && (
                                                     <div className="flex flex-wrap justify-end gap-1.5 max-w-[50%]">
                                                         {memo.tags.map((tag, i) => (
                                                             <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--theme-color)]/10 text-[var(--theme-color)] text-[10px] font-bold tracking-wide">
                                                                 #{tag}
                                                             </span>
                                                         ))}
                                                     </div>
                                                 )}
                                            </div>

                                            <div className="prose prose-stone prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed">
                                                <MarkdownRenderer content={memo.content} />
                                            </div>

                                            {memo.images && memo.images.length > 0 && (
                                                <div className={`mt-5 grid gap-2 ${memo.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                    {memo.images.map((img, i) => (
                                                        <img 
                                                            key={i} 
                                                            src={img} 
                                                            alt="Memo attachment" 
                                                            className="rounded-2xl border border-gray-100 w-full h-auto object-cover max-h-80 hover:scale-[1.01] transition-transform duration-500"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="pl-8 text-gray-400 italic">暂无记录，去控制台写一条吧。</div>
                )}
            </div>
        </div>
    );
};
