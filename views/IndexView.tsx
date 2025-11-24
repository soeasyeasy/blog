/**
 * 首页视图组件
 * BlogOS 应用的首页，展示网站概览、特色文章和最新文章
 */

import React, { useState, useEffect, useRef } from "react";
// 导入图标组件
import { Search, X, ChevronRight, Navigation, Sun, Cloud, Wind, CloudRain, CloudSnow, CloudLightning, RefreshCw, Sparkles, ArrowRight, ArrowUpRight, Clock, MapPin, Palette } from "lucide-react";
// 导入类型定义
import { Post, SiteConfig } from "../types";
// 导入工具函数
import { formatDate } from "../lib/utils";

// 首页视图组件属性接口
interface IndexViewProps {
  posts: Post[];                           // 文章数组
  onRead: (id: string) => void;            // 阅读文章回调函数
  config: SiteConfig;                      // 站点配置
  onUpdateTheme: (color: string) => void;  // 更新主题回调函数
  onSearch: (query: string) => void;       // 搜索回调函数
  onViewAll: () => void;                   // 查看全部回调函数
  isAuthenticated: boolean;                // 用户认证状态
}

// 天气数据接口定义
interface WeatherData {
  current: {
      temperature: number;      // 当前温度
      weathercode: number;      // 天气代码
  };
  daily?: {
      time: string[];           // 日期数组
      weathercode: number[];    // 天气代码数组
      temperature_2m_max: number[];  // 最高温度数组
      temperature_2m_min: number[];  // 最低温度数组
  };
}

// 位置数据接口定义
interface LocationData {
  city: string;        // 城市
  region: string;      // 地区
  country: string;     // 国家
  ip: string;          // IP 地址
  latitude: number;    // 纬度
  longitude: number;   // 经度
}

// 一言数据接口定义
interface HitokotoData {
  hitokoto: string;    // 一言内容
  from: string;        // 来源
}

// 默认位置数据
const FALLBACK_LOCATION: LocationData = {
  city: "Cupertino", region: "California", country: "USA", ip: "127.0.0.1", latitude: 37.3346, longitude: -122.0090
};

// 默认一言数据
const FALLBACK_QUOTES: HitokotoData[] = [
  { hitokoto: "保持饥饿，保持愚蠢。", from: "Steve Jobs" },
  { hitokoto: "简单是终极的复杂。", from: "达·芬奇" },
  { hitokoto: "Talk is cheap. Show me the code.", from: "Linus Torvalds" },
  { hitokoto: "设计不仅仅是外观，更是运作方式。", from: "Steve Jobs" },
];

// 预设主题颜色
const PRESET_THEMES = [
  { name: "Cosmic Blue", color: "#007AFF" }, 
  { name: "Royal Purple", color: "#5856D6" }, 
  { name: "Titanium Gray", color: "#8E8E93" },
  { name: "Midnight", color: "#1c1c1e" }, 
  { name: "Sunset Gold", color: "#FF9500" }, 
  { name: "Ruby Red", color: "#FF2D55" }, 
  { name: "Teal Blue", color: "#30B0C7" }, 
  { name: "Emerald", color: "#34C759" }, 
];

// 首页视图组件
export const IndexView = ({ 
  posts, 
  onRead, 
  config,
  onUpdateTheme,
  onSearch,
  onViewAll,
  isAuthenticated
}: IndexViewProps) => {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState("");          // 搜索关键词
  const [weather, setWeather] = useState<WeatherData | null>(null);  // 天气数据
  const [location, setLocation] = useState<LocationData | null>(null);  // 位置数据
  const [quote, setQuote] = useState<HitokotoData | null>(null);  // 一言数据
  const [loadingQuote, setLoadingQuote] = useState(false);     // 一言加载状态
  const [quoteProgress, setQuoteProgress] = useState(0);       // 一言进度条
  
  // 手动位置和天气详情状态
  const [showLocationInput, setShowLocationInput] = useState(false);  // 是否显示位置输入框
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);  // 是否显示天气详情
  const [manualCity, setManualCity] = useState("");            // 手动输入的城市
  const [isSearchingCity, setIsSearchingCity] = useState(false);  // 城市搜索状态
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);  // 是否显示主题选择器
  
  // 引用 DOM 元素
  const locationInputRef = useRef<HTMLDivElement>(null);

  // 获取主题颜色
  const themeColor = config.themeColor || '#0071e3';
  // 一言定时器引用
  const quoteTimerRef = useRef<number | null>(null);
  // 进度条定时器引用
  const progressTimerRef = useRef<number | null>(null);

  // --- 点击外部关闭天气输入框 ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationInput(false);
        // Only close detail if not clicking inside the widget itself (which toggles it)
      }
    };

    if (showLocationInput) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLocationInput]);

  // --- 数据获取 ---
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      let locData = FALLBACK_LOCATION;
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (!data.error) locData = { ...FALLBACK_LOCATION, ...data, city: data.city || FALLBACK_LOCATION.city };
        }
      } catch (e) {}
      
      if (isMounted) {
        setLocation(locData);
        fetchWeather(locData.latitude, locData.longitude);
      }
    };
    initData();
    fetchQuote();
    return () => { isMounted = false; };
  }, []);

  // --- 一言自动刷新 ---
  useEffect(() => {
    const interval = 30000;
    const step = 100;
    
    const startTimers = () => {
        setQuoteProgress(0);
        let elapsed = 0;
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        
        progressTimerRef.current = window.setInterval(() => {
            elapsed += step;
            const p = Math.min((elapsed / interval) * 100, 100);
            setQuoteProgress(p);
        }, step);

        if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
        quoteTimerRef.current = window.setTimeout(() => {
            fetchQuote();
        }, interval);
    };

    startTimers();

    return () => {
        if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [quote]);

  /**
   * 获取天气数据
   * @param lat 纬度
   * @param lon 经度
   */
  const fetchWeather = async (lat: number, lon: number) => {
    try {
      // 获取当前天气和每日预报
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWeather({ 
          current: {
              temperature: data.current_weather.temperature, 
              weathercode: data.current_weather.weathercode 
          },
          daily: data.daily
      });
    } catch { 
        setWeather({ 
            current: { temperature: 22, weathercode: 0 } 
        }); 
    }
  };

  /**
   * 处理手动位置搜索
   * @param e 表单事件
   */
  const handleManualLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    setIsSearchingCity(true);
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(manualCity)}&count=1&language=zh&format=json`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const newLoc = { ...FALLBACK_LOCATION, city: result.name, country: result.country || "", latitude: result.latitude, longitude: result.longitude };
            setLocation(newLoc);
            fetchWeather(newLoc.latitude, newLoc.longitude);
            setShowLocationInput(false);
            setManualCity("");
        } else {
            alert("未找到该城市，请尝试使用拼音或英文 (如: Beijing)");
        }
    } catch (err) {
        alert("搜索失败，请重试");
    } finally {
        setIsSearchingCity(false);
    }
  };

  /**
   * 获取一言数据
   */
  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k', { signal: controller.signal });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuote({ hitokoto: data.hitokoto, from: data.from });
    } catch { 
        const nextQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        setQuote(nextQuote); 
    } 
    finally { setLoadingQuote(false); }
  };

  /**
   * 获取天气图标
   * @param code 天气代码
   * @param className CSS 类名
   * @returns JSX.Element
   */
  const getWeatherIcon = (code: number, className = "w-5 h-5") => {
    if (code === 0) return <Sun className={`${className} text-yellow-400`} />;
    if (code >= 1 && code <= 3) return <Cloud className={`${className} text-gray-400`} />;
    if (code >= 45 && code <= 48) return <Wind className={`${className} text-gray-400`} />;
    if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-400`} />;
    if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-gray-300`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-yellow-400`} />;
    return <Sun className={`${className}`} />;
  };

  // 查找特色文章（优先级：特色标志 -> 第一篇文章）
  const featuredPost = posts.find(p => p.featured) || posts[0];
  // 最新文章（排除特色文章）
  const latestPosts = posts.filter(p => p.id !== featuredPost?.id).slice(0, 3);

  return (
    <div className="animate-fade-in space-y-12 pb-20 pt-4 px-0">
      
      {/* --- 沉浸式横幅 --- */}
      {/* 
          重构以修复 Z-Index/溢出问题：
          外层容器不使用 overflow-hidden，允许弹出框溢出。
          背景容器使用圆角和 overflow-hidden 来裁剪背景。
      */}
      <div className="relative w-full min-h-[560px] flex flex-col items-center justify-center text-center group select-none shadow-xl shadow-gray-200/50 mx-auto max-w-[calc(100%-1rem)] sm:max-w-full rounded-[48px]">
           
           {/* 背景 - 需要 overflow-hidden 来裁剪图片/色块 */}
           <div className="absolute inset-0 z-0 rounded-[48px] overflow-hidden bg-white">
              {config.heroImage ? (
                // 自定义背景图片
                <div className="w-full h-full relative">
                    <img src={config.heroImage} className="w-full h-full object-cover opacity-90 animate-subtle-zoom" alt="Banner" />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ) : (
                 // 默认背景色块
                 <div className="w-full h-full relative overflow-hidden bg-gray-50">
                    <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 50% 50%, ${themeColor}, transparent 70%)` }} />
                    <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob" style={{ backgroundColor: themeColor }} />
                    <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: `${themeColor}88` }} />
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
                 </div>
              )}
           </div>

           {/* 内容 - 更高的 Z-index，无 overflow-hidden，因此弹出框可以浮动 */}
           <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center gap-8">
               
               {/* 站点品牌信息 */}
               <div className="space-y-4 animate-slide-up">
                   <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-[#1D1D1F] drop-shadow-sm leading-tight">
                       {config.heroTitle}
                   </h1>
                   <p className="text-xl sm:text-2xl text-gray-600 font-medium max-w-xl mx-auto leading-relaxed">
                       {config.heroSubtitle}
                   </p>
               </div>

               {/* 聚焦搜索栏 */}
               <div className="w-full max-w-xl relative group animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 transform group-focus-within:scale-[1.02] transition-all duration-300" />
                    <div className="relative flex items-center h-16 px-6">
                        <Search className="w-5 h-5 text-gray-500 mr-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchQuery)}
                            className="w-full bg-transparent border-none text-lg text-[#1D1D1F] placeholder-gray-500 focus:ring-0 p-0 font-medium"
                            placeholder="搜索灵感、文章或话题..."
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-gray-200/50 rounded-full text-gray-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <div className={`ml-2 px-2 py-1 rounded border border-gray-400/30 text-[10px] font-bold text-gray-500 hidden sm:block transition-opacity ${searchQuery ? 'opacity-0' : 'opacity-100'}`}>
                            ⌘ K
                        </div>
                    </div>
               </div>

               {/* 小部件行 */}
               <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                   
                   {/* 天气小部件 */}
                   <div className="relative" ref={locationInputRef}>
                        {weather && (
                            <div 
                                onClick={() => setShowWeatherDetail(!showWeatherDetail)}
                                className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 border border-white/50 shadow-sm hover:bg-white/80 transition-colors cursor-pointer select-none"
                            >
                                {getWeatherIcon(weather.current.weathercode)}
                                <span className="text-sm font-bold text-[#1D1D1F]">{Math.round(weather.current.temperature)}°</span>
                                <span className="w-px h-3 bg-gray-300 mx-1"></span>
                                <span className="text-xs font-medium text-gray-500">{location?.city || "Location"}</span>
                            </div>
                        )}
                        
                        {/* 天气详情和位置输入弹出框 */}
                        {(showWeatherDetail || showLocationInput) && weather && (
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 z-50 w-80 animate-fade-in border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2">
                                            {location?.city} 
                                            <button onClick={() => setShowLocationInput(!showLocationInput)} className="text-gray-400 hover:text-black"><MapPin className="w-4 h-4" /></button>
                                        </h3>
                                        <p className="text-xs text-gray-500">{weather.daily?.time[0]}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-light text-[#1D1D1F]">{Math.round(weather.current.temperature)}°</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{getWeatherIcon(weather.current.weathercode, "w-4 h-4 inline mr-1")}</div>
                                    </div>
                                </div>
                                
                                {/* 位置输入框 */}
                                {showLocationInput && (
                                    <form onSubmit={handleManualLocationSearch} className="flex gap-2 mb-4">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-black"
                                            placeholder="拼音/英文 (如 Shanghai)" 
                                            value={manualCity}
                                            onChange={e => setManualCity(e.target.value)}
                                        />
                                        <button disabled={isSearchingCity} type="submit" className="bg-black text-white p-2 rounded-lg text-xs font-bold disabled:opacity-50">
                                            {isSearchingCity ? "..." : <ArrowRight className="w-4 h-4" />}
                                        </button>
                                    </form>
                                )}

                                {/* 7日天气预报 */}
                                {weather.daily && (
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">7-Day Forecast</h4>
                                        <div className="space-y-2">
                                            {weather.daily.time.slice(0, 7).map((date, i) => (
                                                <div key={date} className="flex items-center justify-between text-sm">
                                                    <span className="w-10 text-gray-500 font-medium">
                                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                    </span>
                                                    <div className="flex-1 flex justify-center">
                                                        {getWeatherIcon(weather.daily!.weathercode[i], "w-4 h-4")}
                                                    </div>
                                                    <div className="w-20 text-right text-xs font-medium text-gray-600">
                                                        <span className="text-gray-400">{Math.round(weather.daily!.temperature_2m_min[i])}°</span>
                                                        <span className="mx-1 text-gray-300">/</span>
                                                        <span>{Math.round(weather.daily!.temperature_2m_max[i])}°</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* 关闭按钮 */}
                                <button 
                                    onClick={() => { setShowWeatherDetail(false); setShowLocationInput(false); }}
                                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full text-gray-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                   </div>

                   {/* 一言小部件 */}
                   <div className="relative group/quote">
                       <div 
                         onClick={fetchQuote}
                         className="bg-black/80 backdrop-blur-md px-5 py-2 rounded-full flex items-center gap-3 border border-white/10 shadow-sm hover:bg-black transition-colors cursor-pointer text-white max-w-[280px] sm:max-w-md overflow-hidden"
                       >
                           <span className="text-sm font-serif italic truncate opacity-90">
                               "{quote?.hitokoto || "Loading..."}"
                           </span>
                           {loadingQuote && <RefreshCw className="w-3 h-3 animate-spin opacity-50 shrink-0" />}
                       </div>
                       {/* 自动刷新进度条 */}
                       <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden">
                           <div 
                                className="h-full bg-white/40 transition-all duration-100 ease-linear" 
                                style={{ width: `${quoteProgress}%` }}
                           />
                       </div>
                   </div>

                   {/* 公共主题选择器（在首页可见） */}
                   <div className="relative">
                      <button 
                        onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                        className="p-2.5 bg-white/60 backdrop-blur-md hover:bg-white/80 rounded-full text-[#1D1D1F] transition-all shadow-sm border border-white/20"
                        title="切换主题"
                      >
                        <Palette className="w-5 h-5" />
                      </button>

                      {isThemePickerOpen && (
                         <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 flex gap-2 animate-fade-in z-30 w-max">
                            {PRESET_THEMES.map(theme => (
                                 <button
                                   key={theme.name}
                                   onClick={() => {
                                     onUpdateTheme(theme.color);
                                     // Optional: keep open or close
                                   }}
                                   className={`w-6 h-6 rounded-full border border-black/5 relative hover:scale-110 transition-transform ${themeColor?.toLowerCase() === theme.color.toLowerCase() ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`}
                                   style={{ backgroundColor: theme.color }}
                                   title={theme.name}
                                 />
                            ))}
                         </div>
                      )}
                   </div>
               </div>
           </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* --- 特色文章部分 --- */}
        {featuredPost && (
            <section className="animate-slide-up mb-20" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2 mb-6 px-1 opacity-60">
                    <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-xs font-bold uppercase tracking-widest">Featured Story</span>
                </div>
                
                <div 
                    onClick={() => onRead(featuredPost.id)}
                    className="group relative cursor-pointer bg-white rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col lg:flex-row min-h-[460px]"
                >
                    <div className="lg:w-3/5 relative overflow-hidden h-72 lg:h-auto bg-gray-100">
                        <img src={featuredPost.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="cover" />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        <div className="absolute top-6 left-6">
                             <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-black shadow-sm">
                                {featuredPost.category.split('/').pop()}
                             </span>
                        </div>
                    </div>
                    <div className="lg:w-2/5 p-10 sm:p-14 flex flex-col justify-center bg-white relative">
                        <div className="absolute top-10 right-10">
                            <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-[var(--theme-color)] transition-colors" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                            <span>{formatDate(featuredPost.date)}</span>
                            <span>•</span>
                            <span>{featuredPost.author}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] leading-[1.1] mb-6 group-hover:text-[var(--theme-color)] transition-colors">
                            {featuredPost.title}
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed line-clamp-4 mb-8">
                            {featuredPost.excerpt}
                        </p>
                        <div className="mt-auto flex items-center font-bold text-sm text-[#1D1D1F] group-hover:text-[var(--theme-color)] transition-colors">
                            阅读全文 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* --- 最新文章网格 --- */}
        {latestPosts.length > 0 && (
            <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between mb-8 px-1">
                    <div className="flex items-center gap-2 opacity-60">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Latest Drops</span>
                    </div>
                    <button onClick={onViewAll} className="text-xs font-bold uppercase tracking-widest hover:text-[var(--theme-color)] flex items-center gap-1 transition-colors group">
                        View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {latestPosts.map((post) => (
                    <div 
                    key={post.id} 
                    onClick={() => onRead(post.id)}
                    className="group cursor-pointer flex flex-col bg-white rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 overflow-hidden h-full"
                    >
                    <div className="relative overflow-hidden w-full aspect-[4/3] bg-gray-100 shrink-0">
                        <img src={post.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="cover" />
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-black shadow-sm">
                                {post.category.split('/').pop()}
                            </span>
                        </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                        <div className="text-xs font-bold text-gray-400 uppercase mb-3">{formatDate(post.date)}</div>
                        <h3 className="font-bold text-xl text-[#1D1D1F] leading-snug mb-3 group-hover:text-[var(--theme-color)] transition-colors line-clamp-2">
                        {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-auto">
                            {post.excerpt}
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            </section>
        )}
      </div>

      {/* --- 页脚 --- */}
      <footer className="pt-24 pb-8 text-center border-t border-gray-200/50 mt-20">
         <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] flex items-center justify-center">
                 <span className="text-white font-bold text-sm">B</span>
             </div>
             <span className="font-bold text-[#1D1D1F] tracking-tight text-lg">{config.siteName}</span>
         </div>
         <p className="text-sm text-gray-400 font-medium">© {new Date().getFullYear()} {config.siteName}. Designed with Apple Style.</p>
         {config.icpNumber && (
           <p className="text-xs text-gray-300 mt-2 hover:text-gray-400 transition-colors">
             <a href="https://beian.miit.gov.cn/" target="_blank">{config.icpNumber}</a>
           </p>
         )}
      </footer>
    </div>
  );
};