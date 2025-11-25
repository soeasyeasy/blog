/**
 * API 工具文件
 * 提供与后端 API 交互的封装函数，以及本地存储的 fallback 实现
 */

import { Post, SiteConfig, Comment, Memo, Todo, Schedule } from "../types";
import { generateId } from "./utils";

// 本地存储键名常量
const DB_KEY_POSTS = "blog_posts_data";
const DB_KEY_CONFIG = "blog_site_config";
const DB_KEY_MEMOS = "blog_memos_data";
const DB_KEY_TODOS = "blog_todos_data";
const DB_KEY_SCHEDULES = "blog_schedules_data";
// 后端 API 基础 URL
const BASE_URL = "http://localhost:8080/api";

// --- 默认数据（用于 fallback） ---

// 默认站点配置
const DEFAULT_CONFIG: SiteConfig = {
  siteName: "BlogOS",
  heroTitle: "灵感，\n触手可及。",
  heroSubtitle: "Markdown 驱动，本地数据库。",
  heroImage: "",
  logoUrl: "",
  icpNumber: "",
  themeColor: "#0071e3",
  seo: {
    siteTitle: "BlogOS - Minimalist Personal Blog",
    description: "A beautiful, minimalist blog system designed with Apple aesthetics.",
    keywords: ["blog", "react", "design", "minimalist"],
    ogImage: ""
  },
  profile: {
    name: "Create User",
    bio: "全栈开发者 / UI 设计师 / 极简主义者",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop",
    location: "San Francisco, CA",
    email: "hello@example.com",
    github: "github.com",
    jobTitle: "Senior Frontend Engineer",
    company: "Apple Inc.",
    website: "https://example.com",
    availableForHire: true,
    skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Design Systems"],
    socials: {
        linkedin: "linkedin.com",
        instagram: "instagram.com"
    },
    readme: "### 👋 Hi there\n\n我是一名热衷于构建优美用户界面的开发者。\n\n- 🔭 目前正在开发 **BlogOS**\n- 🌱 正在学习 **Rust** 和 **WebAssembly**\n- 💬 欢迎与我讨论 **React** 与 **Design Systems**\n\n![Github Stats](https://github-readme-stats.vercel.app/api?username=facebook&show_icons=true&hide_border=true&bg_color=00000000&text_color=718096&icon_color=0071e3)"
  },
  friendLinks: [
    {
      id: "1",
      name: "React",
      url: "https://react.dev",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
      description: "The library for web and native user interfaces",
      category: "技术框架"
    },
    {
      id: "2",
      name: "Tailwind CSS",
      url: "https://tailwindcss.com",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
      description: "Rapidly build modern websites.",
      category: "技术框架"
    },
    {
      id: "3",
      name: "Dribbble",
      url: "https://dribbble.com",
      avatar: "https://cdn.dribbble.com/assets/dribbble-ball-icon-e66057dc3e255ca2507b973e6a41334f0f62d854e60ca837659556d116345600.svg",
      description: "Discover the world’s top designers & creatives.",
      category: "设计灵感"
    },
    {
        id: "4",
        name: "Next.js",
        url: "https://nextjs.org",
        avatar: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png",
        description: "The React Framework for the Web",
        category: "技术框架"
    }
  ],
  friendsMessage: "连接思想，分享价值。欢迎申请友链。",
  sso: {
    enabled: false,
    providerName: "Okta",
    loginUrl: "https://example.com/sso/login"
  }
};

// 默认文章数据
const DEFAULT_POSTS: Post[] = [
  {
    id: "1",
    title: "设计的未来：空间计算",
    excerpt: "探索 Vision Pro 带来的全新交互范式，当数字内容与物理空间无缝融合，我们将如何重新定义设计语言。",
    content: "# 空间计算\n\n空间计算不仅仅是将屏幕悬浮在空中。它是关于深度、光影、比例以及人类感知的全新探索。当我们打破矩形边框的限制，UI 变成了环境的一部分...\n\n## 材质的艺术\n\n材质的运用变得至关重要，**玻璃材质**能够让用户保持与现实世界的连接。在设计空间界面时，我们需要考虑视差效果、动态光照以及人体工学的舒适度。\n\n> 这不是简单的将 2D 界面 3D 化，而是从根本上重新思考人机交互的维度。\n\n## 交互范式\n\n眼动追踪与手势操作的结合，创造了如同魔法般的体验。我们不再通过鼠标点击，而是通过**注视**来表达意图。\n\n![Vision Pro](https://images.unsplash.com/photo-1621768216002-5ac171876625?q=80&w=1000&auto=format&fit=crop)",
    coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
    date: "2023-10-24",
    tags: ["Spatial", "Future"],
    category: "Design/UI/Spatial",
    author: "Jonathan Ive",
    comments: [
        {
            id: "c1",
            author: "Tim Cook",
            content: "Incredible work, Jony! This is the future.",
            date: "2023-10-25",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
            replies: [
                {
                    id: "c1-r1",
                    author: "Jonathan Ive",
                    content: "Thanks Tim!",
                    date: "2023-10-25"
                }
            ]
        }
    ],
    featured: true,
    likes: 124
  },
  {
    id: "2",
    title: "极简主义的摄影艺术",
    excerpt: "少即是多。如何在纷繁复杂的世界中捕捉那一抹纯粹的光影？",
    content: "# 减法的艺术\n\n摄影是减法的艺术。通过剔除画面中不必要的元素，我们强迫观众关注主体。\n\n- 构图\n- 负空间\n- 线条\n\n这些基础元素在极简摄影中被无限放大...",
    coverImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1000&auto=format&fit=crop",
    date: "2023-11-15",
    tags: ["Minimalism", "Art"],
    category: "Art/Photography",
    author: "Ansel Adams",
    comments: [],
    likes: 89
  },
  {
    id: "3",
    title: "Swift 与声明式编程",
    excerpt: "SwiftUI 改变了我们构建界面的方式。从命令式到声明式的思维转变。",
    content: "# 声明式 UI\n\n状态驱动 UI。这是一个核心概念。我们不再手动操作视图层级，而是描述视图在不同状态下应该长什么样。\n\n## 代码示例\n\n```swift\nstruct ContentView: View {\n    var body: some View {\n        Text('Hello World')\n            .padding()\n    }\n}\n```\n\n结合 Combine 框架，我们可以构建出响应迅速、代码简洁的现代应用程序。",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
    date: "2023-12-01",
    tags: ["Swift", "Dev"],
    category: "Code/Frontend/Swift",
    author: "Craig F",
    comments: [],
    likes: 45
  }
];

// 默认随手记数据
const DEFAULT_MEMOS: Memo[] = [
  {
    id: "m1",
    content: "灵感通常在深夜降临。就像此刻，突然想到了一个新的 UI 组件设计思路，关于 fluid interface 的交互细节。记录下来。",
    date: new Date().toISOString(),
    tags: ["设计", "灵感"]
  },
  {
    id: "m2",
    content: "今天喝了一杯很棒的手冲咖啡，豆子是埃塞俄比亚的耶加雪菲。生活中的小确幸。",
    date: new Date(Date.now() - 86400000).toISOString(),
    images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop"],
    tags: ["生活", "咖啡"]
  }
];

// --- 带 fallback 的获取助手函数 ---
/**
 * 通用的 fetch 函数，带有本地存储 fallback
 * @param endpoint API 端点
 * @param options fetch 选项
 * @param fallbackFn fallback 函数
 * @returns Promise<T>
 */
async function fetchWithFallback<T>(
    endpoint: string, 
    options: RequestInit | undefined, 
    fallbackFn: () => T | Promise<T>
): Promise<T> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, options);
        if (res.ok) {
             const data = await res.json();
             return data;
        } else if (res.status === 429) {
            // 处理限流错误
            throw new Error("请求过于频繁，请稍后再试");
        }
        throw new Error(`API Error: ${res.status}`);
    } catch (e) {
        // console.warn(`Backend connection failed for ${endpoint}, using local storage.`, e);
        return fallbackFn();
    }
}

// --- 本地存储实现（Fallback） ---
const localImpl = {
    // 获取文章
    getPosts: () => {
        try {
            const saved = localStorage.getItem(DB_KEY_POSTS);
            return saved ? JSON.parse(saved) : DEFAULT_POSTS;
        } catch { return DEFAULT_POSTS; }
    },
    // 保存文章
    savePosts: (posts: Post[]) => localStorage.setItem(DB_KEY_POSTS, JSON.stringify(posts)),
    
    // 获取随手记
    getMemos: () => {
        try {
            const saved = localStorage.getItem(DB_KEY_MEMOS);
            return saved ? JSON.parse(saved) : DEFAULT_MEMOS;
        } catch { return DEFAULT_MEMOS; }
    },
    // 保存随手记
    saveMemos: (memos: Memo[]) => localStorage.setItem(DB_KEY_MEMOS, JSON.stringify(memos)),

    // 获取待办事项
    getTodos: () => {
        try {
            const saved = localStorage.getItem(DB_KEY_TODOS);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    },
    // 保存待办事项
    saveTodos: (todos: Todo[]) => localStorage.setItem(DB_KEY_TODOS, JSON.stringify(todos)),

    // 获取日程安排
    getSchedules: () => {
        try {
            const saved = localStorage.getItem(DB_KEY_SCHEDULES);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    },
    // 保存日程安排
    saveSchedules: (schedules: Schedule[]) => localStorage.setItem(DB_KEY_SCHEDULES, JSON.stringify(schedules)),

    // 获取配置
    getConfig: () => {
        try {
            const saved = localStorage.getItem(DB_KEY_CONFIG);
            const loadedConfig = saved ? JSON.parse(saved) : DEFAULT_CONFIG;
            return { 
                ...DEFAULT_CONFIG, 
                ...loadedConfig,
                seo: { ...DEFAULT_CONFIG.seo, ...(loadedConfig.seo || {}) },
                profile: { 
                    ...DEFAULT_CONFIG.profile, 
                    ...(loadedConfig.profile || {}),
                    socials: { ...DEFAULT_CONFIG.profile.socials, ...(loadedConfig.profile?.socials || {}) }
                },
                sso: { ...DEFAULT_CONFIG.sso, ...(loadedConfig.sso || {}) },
                friendLinks: loadedConfig.friendLinks || DEFAULT_CONFIG.friendLinks,
                friendsMessage: loadedConfig.friendsMessage || DEFAULT_CONFIG.friendsMessage
            };
        } catch { return DEFAULT_CONFIG; }
    },
    // 保存配置
    saveConfig: (config: SiteConfig) => localStorage.setItem(DB_KEY_CONFIG, JSON.stringify(config))
};

// --- 导出的异步 API ---

export const api = {
  // 文章相关 API
  /**
   * 获取所有文章
   * @returns Promise<Post[]>
   */
  getPosts: async (): Promise<Post[]> => {
    return fetchWithFallback('/posts', undefined, localImpl.getPosts);
  },
  
  /**
   * 添加或更新文章
   * @param post 文章对象
   * @returns Promise<void>
   */
  addOrUpdatePost: async (post: Post): Promise<void> => {
    return fetchWithFallback('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    }, () => {
        let posts = localImpl.getPosts();
        if (post.featured) posts = posts.map(p => ({ ...p, featured: false }));
        const index = posts.findIndex(p => p.id === post.id);
        if (index >= 0) posts[index] = post;
        else posts = [post, ...posts];
        localImpl.savePosts(posts);
    });
  },

  /**
   * 删除文章
   * @param id 文章 ID
   * @returns Promise<void>
   */
  deletePost: async (id: string): Promise<void> => {
    return fetchWithFallback(`/posts/${id}`, { method: 'DELETE' }, () => {
        const posts = localImpl.getPosts();
        localImpl.savePosts(posts.filter(p => p.id !== id));
    });
  },

  /**
   * 点赞文章
   * @param id 文章 ID
   * @returns Promise<Post | null>
   */
  likePost: async (id: string): Promise<Post | null> => {
      return fetchWithFallback(`/posts/${id}/like`, { method: 'POST' }, () => {
        const posts = localImpl.getPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            const post = posts[index];
            const updated = { ...post, likes: (post.likes || 0) + 1 };
            posts[index] = updated;
            localImpl.savePosts(posts);
            return updated;
        }
        return null;
      });
  },

  /**
   * 添加评论
   * @param postId 文章 ID
   * @param comment 评论对象
   * @param parentId 父评论 ID（可选）
   * @returns Promise<Post | null>
   */
  addComment: async (postId: string, comment: Omit<Comment, 'id' | 'date'>, parentId?: string): Promise<Post | null> => {
      return fetchWithFallback(`/posts/${postId}/comments?parentId=${parentId || ''}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comment)
      }, () => {
        const posts = localImpl.getPosts();
        const index = posts.findIndex(p => p.id === postId);
        if (index !== -1) {
            const post = posts[index];
            const newComment: Comment = {
                ...comment,
                id: generateId(),
                date: new Date().toISOString().split('T')[0],
                replies: []
            };

            if (parentId) {
                const addReplyRecursively = (comments: Comment[]): boolean => {
                    for (let c of comments) {
                        if (c.id === parentId) {
                            c.replies = [...(c.replies || []), newComment];
                            return true;
                        }
                        if (c.replies && c.replies.length > 0) {
                            if (addReplyRecursively(c.replies)) return true;
                        }
                    }
                    return false;
                };
                const commentsCopy = JSON.parse(JSON.stringify(post.comments || []));
                if (addReplyRecursively(commentsCopy)) {
                    const updatedPost = { ...post, comments: commentsCopy };
                    posts[index] = updatedPost;
                    localImpl.savePosts(posts);
                    return updatedPost;
                }
            }

            const updatedPost = { ...post, comments: [...(post.comments || []), newComment] };
            posts[index] = updatedPost;
            localImpl.savePosts(posts);
            return updatedPost;
        }
        return null;
      });
  },

  // 随手记相关 API
  /**
   * 获取所有随手记
   * @returns Promise<Memo[]>
   */
  getMemos: async (): Promise<Memo[]> => {
      return fetchWithFallback('/memos', undefined, localImpl.getMemos);
  },
  
  /**
   * 添加随手记
   * @param content 随手记内容
   * @param images 图片 URL 数组（可选）
   * @param tags 标签数组（可选）
   * @returns Promise<Memo[]>
   */
  addMemo: async (content: string, images?: string[], tags?: string[]): Promise<Memo[]> => {
      const newMemo: Partial<Memo> = { content, images, tags, date: new Date().toISOString() };
      return fetchWithFallback('/memos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMemo)
      }, () => {
          const memos = localImpl.getMemos();
          const memo: Memo = { id: generateId(), content, date: new Date().toISOString(), images, tags };
          const newMemos = [memo, ...memos];
          localImpl.saveMemos(newMemos);
          return newMemos;
      });
  },

  /**
   * 删除随手记
   * @param id 随手记 ID
   * @returns Promise<Memo[]>
   */
  deleteMemo: async (id: string): Promise<Memo[]> => {
      return fetchWithFallback(`/memos/${id}`, { method: 'DELETE' }, () => {
          const memos = localImpl.getMemos();
          const newMemos = memos.filter(m => m.id !== id);
          localImpl.saveMemos(newMemos);
          return newMemos;
      });
  },

  // 待办事项相关 API
  /**
   * 获取所有待办事项
   * @returns Promise<Todo[]>
   */
  getTodos: async (): Promise<Todo[]> => {
      return fetchWithFallback('/todos', undefined, localImpl.getTodos);
  },
  
  /**
   * 添加待办事项
   * @param text 待办事项内容
   * @param priority 优先级
   * @param date 日期
   * @returns Promise<Todo[]>
   */
  addTodo: async (text: string, priority: 'low'|'medium'|'high', date: string): Promise<Todo[]> => {
      const todo: Partial<Todo> = { text, priority, date, completed: false };
      return fetchWithFallback('/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todo)
      }, () => {
          const todos = localImpl.getTodos();
          const newTodo: Todo = { id: generateId(), text, priority, date, completed: false };
          const newTodos = [...todos, newTodo];
          localImpl.saveTodos(newTodos);
          return newTodos;
      });
  },

  /**
   * 切换待办事项完成状态
   * @param id 待办事项 ID
   * @returns Promise<Todo[]>
   */
  toggleTodo: async (id: string): Promise<Todo[]> => {
      return fetchWithFallback(`/todos/${id}/toggle`, { method: 'PUT' }, () => {
          const todos = localImpl.getTodos();
          const newTodos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
          localImpl.saveTodos(newTodos);
          return newTodos;
      });
  },

  /**
   * 删除待办事项
   * @param id 待办事项 ID
   * @returns Promise<Todo[]>
   */
  deleteTodo: async (id: string): Promise<Todo[]> => {
      return fetchWithFallback(`/todos/${id}`, { method: 'DELETE' }, () => {
          const todos = localImpl.getTodos();
          const newTodos = todos.filter(t => t.id !== id);
          localImpl.saveTodos(newTodos);
          return newTodos;
      });
  },

  // 日程安排相关 API
  /**
   * 获取所有日程安排
   * @returns Promise<Schedule[]>
   */
  getSchedules: async (): Promise<Schedule[]> => {
      return fetchWithFallback('/schedules', undefined, localImpl.getSchedules);
  },

  /**
   * 添加日程安排
   * @param title 日程标题
   * @param time 时间
   * @param date 日期
   * @param description 描述（可选）
   * @returns Promise<Schedule[]>
   */
  addSchedule: async (title: string, time: string, date: string, description?: string): Promise<Schedule[]> => {
      const schedule: Partial<Schedule> = { title, time, date, description };
      return fetchWithFallback('/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schedule)
      }, () => {
          const schedules = localImpl.getSchedules();
          const newSchedule: Schedule = { id: generateId(), title, time, date, description };
          const newSchedules = [...schedules, newSchedule].sort((a,b) => a.time.localeCompare(b.time));
          localImpl.saveSchedules(newSchedules);
          return newSchedules;
      });
  },

  /**
   * 删除日程安排
   * @param id 日程安排 ID
   * @returns Promise<Schedule[]>
   */
  deleteSchedule: async (id: string): Promise<Schedule[]> => {
      return fetchWithFallback(`/schedules/${id}`, { method: 'DELETE' }, () => {
          const schedules = localImpl.getSchedules();
          const newSchedules = schedules.filter(s => s.id !== id);
          localImpl.saveSchedules(newSchedules);
          return newSchedules;
      });
  },

  // 配置相关 API
  /**
   * 获取站点配置
   * @returns Promise<SiteConfig>
   */
  getConfig: async (): Promise<SiteConfig> => {
      return fetchWithFallback('/config', undefined, localImpl.getConfig).then(config => {
          // Backend might return raw JSON string if simplistic, but our fetchWithFallback assumes JSON parse.
          // In Local fallback we merge with default.
          // Let's ensure we merge defaults even if from backend to avoid missing keys.
           if (typeof config === 'string') {
               try { config = JSON.parse(config); } catch (e) {}
           }
           return {
               ...DEFAULT_CONFIG,
               ...config,
                seo: { ...DEFAULT_CONFIG.seo, ...(config.seo || {}) },
                profile: { 
                    ...DEFAULT_CONFIG.profile, 
                    ...(config.profile || {}),
                    socials: { ...DEFAULT_CONFIG.profile.socials, ...(config.profile?.socials || {}) }
                },
                sso: { ...DEFAULT_CONFIG.sso, ...(config.sso || {}) },
                friendLinks: config.friendLinks || DEFAULT_CONFIG.friendLinks,
                friendsMessage: config.friendsMessage || DEFAULT_CONFIG.friendsMessage
           };
      });
  },

  /**
   * 保存站点配置
   * @param config 站点配置对象
   * @returns Promise<void>
   */
  saveConfig: async (config: SiteConfig): Promise<void> => {
      return fetchWithFallback('/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
      }, () => {
          localImpl.saveConfig(config);
      });
  },

  // 数据导出/导入 API
  /**
   * 导出所有数据
   * @returns Promise<string>
   */
  exportData: async (): Promise<string> => {
      const posts = await api.getPosts();
      const memos = await api.getMemos();
      const todos = await api.getTodos();
      const schedules = await api.getSchedules();
      const config = await api.getConfig();
      
      const data = {
          posts, memos, todos, schedules, config,
          version: "2.0",
          exportedAt: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
  },

  /**
   * 导入数据
   * @param jsonString JSON 字符串
   * @returns Promise<boolean>
   */
  importData: async (jsonString: string): Promise<boolean> => {
      try {
          const data = JSON.parse(jsonString);
          // For import, we might need a bulk API, but loop for now or just use local save if offline
          // Ideally we post to backend. 
          // Simplification: Import only works reliably in local fallback mode or we need bulk endpoints.
          // Let's just iterate save for now if online.
          if (data.posts) for (let p of data.posts) await api.addOrUpdatePost(p);
          if (data.config) await api.saveConfig(data.config);
          if (data.memos) for (let m of data.memos) await api.addMemo(m.content, m.images, m.tags);
          // ... etc
          return true;
      } catch (e) { return false; }
  }
};