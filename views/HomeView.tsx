
import React, { useState, useMemo, useEffect } from "react";
import { Search, X, ChevronRight, MapPin, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Quote, RefreshCw, Loader2, Navigation, Palette, Check, ArrowDown, Sparkles } from "lucide-react";
import { Post, SiteConfig } from "../types";
import { formatDate } from "../lib/utils";

interface HomeViewProps {
  posts: Post[];
  onRead: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  config: SiteConfig;
  onUpdateTheme: (color: string) => void;
}

// --- Weather & Widget Types ---
interface WeatherData {
  temperature: number;
  weathercode: number;
}

interface LocationData {
  city: string;
  region: string;
  country: string;
  ip: string;
  latitude: number;
  longitude: number;
}

interface HitokotoData {
  hitokoto: string;
  from: string;
}

// Fallback Data Constants
const FALLBACK_LOCATION: LocationData = {
  city: "Cupertino",
  region: "California",
  country: "USA",
  ip: "127.0.0.1",
  latitude: 37.3346,
  longitude: -122.0090
};

const PRESET_THEMES = [
  { name: "Cosmic Blue", color: "#007AFF" }, // iOS Blue
  { name: "Royal Purple", color: "#5856D6" }, // iOS Purple
  { name: "Titanium Gray", color: "#8E8E93" }, // Apple Gray
  { name: "Midnight", color: "#1c1c1e" }, // Apple Dark
  { name: "Sunset Gold", color: "#FF9500" }, // iOS Orange
  { name: "Ruby Red", color: "#FF2D55" }, // iOS Pink
  { name: "Teal Blue", color: "#30B0C7" }, // iOS Teal
  { name: "Emerald", color: "#34C759" }, // iOS Green
];

// Fallback Quotes (Chinese)
const FALLBACK_QUOTES: HitokotoData[] = [
  { hitokoto: "保持饥饿，保持愚蠢。", from: "Steve Jobs" },
  { hitokoto: "简单是终极的复杂。", from: "达·芬奇" },
  { hitokoto: "人生苦短，我用 Python。", from: "佚名" },
  { hitokoto: "代码是写给人看的，只是顺便由机器执行。", from: "Donald Knuth" },
  { hitokoto: "即使是再小的星光，也能照亮前行的路。", from: "佚名" }
];

const PAGE_SIZE = 6; // Grid posts per page (excluding featured)

export const HomeView = ({ 
  posts, 
  onRead, 
  selectedCategory, 
  setSelectedCategory,
  config,
  onUpdateTheme
}: HomeViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  // Widget States
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [quote, setQuote] = useState<HitokotoData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  // --- Fetch Data Effects ---

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      // 1. Location Strategy: Try API -> Fallback to Cupertino
      let locData = FALLBACK_LOCATION;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (!data.error) {
             locData = {
              city: data.city || FALLBACK_LOCATION.city,
              region: data.region || FALLBACK_LOCATION.region,
              country: data.country_name || FALLBACK_LOCATION.country,
              ip: data.ip || FALLBACK_LOCATION.ip,
              latitude: data.latitude || FALLBACK_LOCATION.latitude,
              longitude: data.longitude || FALLBACK_LOCATION.longitude
            };
          }
        }
      } catch (error) {
        console.warn("Location fetch failed, using fallback location.");
      }
      
      if (isMounted) {
        setLocation(locData);
        fetchWeather(locData.latitude, locData.longitude);
      }
    };

    initData();
    fetchQuote();

    return () => { isMounted = false; };
  }, []);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (!res.ok) throw new Error("Weather API failed");
      const data = await res.json();
      setWeather({
        temperature: data.current_weather.temperature,
        weathercode: data.current_weather.weathercode
      });
    } catch (e) {
      console.warn("Weather fetch failed", e);
      setWeather({ temperature: 22, weathercode: 0 }); 
    }
  };

  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error("Quote API failed");
      const data = await res.json();
      setQuote({
        hitokoto: data.hitokoto,
        from: data.from
      });
    } catch (e) {
      const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setQuote(randomQuote);
    } finally {
      setLoadingQuote(false);
    }
  };

  // --- Helpers ---
  
  const getWeatherIcon = (code: number, className = "w-6 h-6") => {
    if (code === 0) return <Sun className={`${className} text-yellow-400`} />;
    if (code >= 1 && code <= 3) return <Cloud className={`${className} text-gray-400`} />;
    if (code >= 45 && code <= 48) return <Wind className={`${className} text-gray-400`} />;
    if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-400`} />;
    if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-gray-300`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-yellow-400`} />;
    return <Sun className={`${className}`} />;
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.author && post.author.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || (post.category && post.category.includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  // Logic: First post is Featured, Rest are Grid
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = filteredPosts.length > 1 ? filteredPosts.slice(1, 1 + visibleCount) : [];
  const hasMore = filteredPosts.length > (1 + visibleCount);

  const themeColor = config.themeColor || '#0071e3';

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  return (
    <div className="animate-fade-in space-y-10 pb-10">
      
      {/* Hero Section */}
      <header className="relative rounded-[40px] overflow-hidden transition-all duration-500 group select-none min-h-[360px] flex flex-col justify-center shadow-lg shadow-gray-200/50">
        {/* Dynamic Background Layer */}
        <div className="absolute inset-0 bg-white">
          {config.heroImage ? (
            <div className="w-full h-full overflow-hidden">
                <img 
                    src={config.heroImage} 
                    className="w-full h-full object-cover opacity-90 animate-subtle-zoom" 
                    alt="Banner" 
                />
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
            </div>
          ) : (
            <div className="w-full h-full relative overflow-hidden bg-gray-50">
                {/* Mesh Gradient Background using themeColor */}
                <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, ${themeColor}, transparent 80%)`
                    }}
                />
                <div 
                    className="absolute top-[-20%] -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"
                    style={{ backgroundColor: themeColor }}
                />
                <div 
                    className="absolute top-[-20%] -right-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"
                    style={{ backgroundColor: `${themeColor}88` }}
                />
                <div 
                    className="absolute -bottom-20 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"
                     style={{ backgroundColor: `${themeColor}44` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/90" />
            </div>
          )}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center py-20 px-6 space-y-6">
            <h1 
                className="text-5xl sm:text-7xl font-bold tracking-tighter text-[#1D1D1F] whitespace-pre-wrap drop-shadow-sm animate-slide-up"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
            >
              {config.heroTitle}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 font-medium tracking-tight max-w-2xl mx-auto drop-shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {config.heroSubtitle}
            </p>
        </div>

        {/* Theme Picker Floating Button */}
        <div className="absolute top-6 right-6 z-20">
           <div className="relative">
              <button 
                onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                className="p-2.5 bg-white/40 backdrop-blur-md hover:bg-white/80 rounded-full text-[#1D1D1F] transition-all shadow-sm border border-white/20"
                title="切换主题"
              >
                <Palette className="w-5 h-5" />
              </button>

              {isThemePickerOpen && (
                 <div className="absolute right-0 top-full mt-2 p-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 flex gap-2 animate-fade-in z-30 w-max">
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
      </header>

      {/* Toolbar: Weather - Search - Quote */}
      <div className="flex flex-col md:flex-row gap-4 animate-slide-up items-stretch z-10 sticky top-20 md:top-6" style={{ animationDelay: '0.2s' }}>
        
        {/* Weather Widget */}
        {location && weather && (
           <div className="order-2 md:order-1 flex items-center justify-between md:justify-center gap-3 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm min-w-[160px] md:w-auto hover:shadow-md transition-all shrink-0">
                <div className="flex items-center gap-2">
                    {getWeatherIcon(weather.weathercode, "w-6 h-6")}
                    <span className="text-xl font-light">{Math.round(weather.temperature)}°</span>
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                   <Navigation className="w-3 h-3" />
                   {location.city}
                </div>
           </div>
        )}

        {/* Search Bar */}
        <div className="order-1 md:order-2 flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--theme-color)] transition-colors" />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full h-full min-h-[56px] pl-12 pr-12 rounded-2xl bg-white/80 backdrop-blur-md border border-transparent text-base shadow-sm placeholder-gray-400 focus:ring-4 focus:ring-black/5 focus:bg-white focus:shadow-xl transition-all hover:shadow-md"
                style={{ "--tw-ring-color": themeColor + '20' } as any}
                placeholder={`搜索 ${selectedCategory === 'All' ? '全站' : selectedCategory.split('/').pop()} 文章...`}
            />
            {searchQuery && (
                <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                >
                <X className="h-4 w-4" />
                </button>
            )}
        </div>

        {/* Quote Widget */}
        {quote && (
            <div className="order-3 md:order-3 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 md:max-w-xs hover:shadow-md transition-all group/quote relative overflow-hidden min-h-[56px]">
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-serif text-gray-700 italic leading-relaxed line-clamp-2 group-hover/quote:line-clamp-none transition-all duration-300">"{quote.hitokoto}"</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">— {quote.from}</p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); fetchQuote(); }}
                    disabled={loadingQuote}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0 self-start mt-0.5"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loadingQuote ? 'animate-spin' : ''}`} />
                </button>
            </div>
        )}
      </div>

      {/* Featured Post Section */}
      {featuredPost && (
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
             <div className="flex items-center gap-2 mb-6 px-1">
                 <Sparkles className="w-5 h-5" style={{ color: themeColor }} />
                 <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Featured Story</span>
             </div>
             
             <div 
                onClick={() => onRead(featuredPost.id)}
                className="group relative cursor-pointer bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col lg:flex-row min-h-[400px]"
             >
                {/* Image Side */}
                <div className="lg:w-7/12 relative overflow-hidden h-64 lg:h-auto">
                    <img 
                        src={featuredPost.coverImage} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                        {featuredPost.category.split('/').map((cat, i) => (
                            <div key={i} className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-black shadow-sm">
                                {cat}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Side */}
                <div className="lg:w-5/12 p-8 sm:p-12 flex flex-col justify-center relative bg-white lg:bg-transparent">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                         <span style={{ color: themeColor }}>{featuredPost.author}</span>
                         <span>•</span>
                         <span>{formatDate(featuredPost.date)}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] leading-tight mb-4 group-hover:text-[var(--theme-color)] transition-colors">
                        {featuredPost.title}
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed line-clamp-4 mb-6">
                        {featuredPost.excerpt}
                    </p>
                    <div className="mt-auto flex items-center font-bold text-sm" style={{ color: themeColor }}>
                        Read Article <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* Grid Posts Section */}
      {gridPosts.length > 0 && (
         <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-6 mt-12 px-1">
                 <div className="w-2 h-2 rounded-full bg-gray-300" />
                 <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Latest Stories</span>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gridPosts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => onRead(post.id)}
                  className="group cursor-pointer flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden border border-gray-100"
                >
                  <div className="relative overflow-hidden w-full h-56 bg-gray-100">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-black shadow-sm">
                            {post.category.split('/').pop()}
                        </div>
                    </div>
                  </div>
                  
                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <h3 className="font-bold text-xl text-[#1D1D1F] leading-snug mb-3 group-hover:text-[var(--theme-color)] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-[var(--theme-color)] font-medium text-xs opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Read more <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="mt-16 flex justify-center pb-8">
                    <button 
                        onClick={handleLoadMore}
                        className="group flex items-center gap-2 px-8 py-3 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md text-sm font-semibold text-gray-600 hover:text-black transition-all active:scale-95"
                    >
                        Load More Stories
                        <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            )}
         </div>
      )}

      {/* Empty State */}
      {!featuredPost && (
        <div className="text-center py-32 text-gray-400 animate-fade-in border-2 border-dashed border-gray-200 rounded-[32px]">
           <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
           <p className="text-lg font-medium">No stories found.</p>
           <button 
             onClick={() => {setSearchQuery(""); setSelectedCategory("All")}}
             className="mt-4 text-[var(--theme-color)] hover:underline text-sm font-medium"
           >
             Clear search filters
           </button>
        </div>
      )}

      {/* Footer with ICP */}
      <footer className="pt-12 pb-4 text-center border-t border-gray-200/50 mt-10">
         <p className="text-sm text-gray-400 font-medium">
           © {new Date().getFullYear()} {config.siteName}. All rights reserved.
         </p>
         {config.icpNumber && (
           <p className="text-xs text-gray-300 mt-2 hover:text-gray-400 transition-colors">
             <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
               {config.icpNumber}
             </a>
           </p>
         )}
      </footer>
    </div>
  );
};
