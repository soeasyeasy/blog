/**
 * 类型定义文件
 * 定义了 BlogOS 应用中使用的所有 TypeScript 类型和接口
 */

// 文章类型定义
export interface Post {
  id: string;                // 文章唯一标识符
  title: string;             // 文章标题
  excerpt: string;           // 文章摘要
  content: string;           // 文章内容（Markdown 格式）
  coverImage: string;        // 封面图片 URL
  date: string;              // 发布日期
  tags: string[];            // 标签数组
  category: string;          // 分类
  author: string;            // 作者
  comments?: Comment[];      // 评论数组（可选）
  featured?: boolean;        // 是否为精选文章（可选）
  likes?: number;            // 点赞数（可选）
}

// 评论类型定义
export interface Comment {
  id: string;                // 评论唯一标识符
  author: string;            // 评论作者
  content: string;           // 评论内容
  date: string;              // 评论日期
  avatar?: string;           // 作者头像 URL（可选）
  replies?: Comment[];       // 回复数组（可选）
}

// 随手记类型定义
export interface Memo {
  id: string;                // 随手记唯一标识符
  content: string;           // 随手记内容
  date: string;              // 创建日期
  images?: string[];         // 图片 URL 数组（可选）
  tags?: string[];           // 标签数组（可选）
}

// 友情链接类型定义
export interface FriendLink {
  id: string;                // 链接唯一标识符
  name: string;              // 链接名称
  url: string;               // 链接 URL
  avatar?: string;           // 链接图标 URL（可选）
  description?: string;      // 链接描述（可选）
  category?: string;         // 链接分类（可选）
}

// 待办事项类型定义
export interface Todo {
  id: string;                // 待办事项唯一标识符
  text: string;              // 待办事项内容
  completed: boolean;        // 是否已完成
  priority: 'low' | 'medium' | 'high';  // 优先级
  date: string;              // 日期（格式：YYYY-MM-DD）
}

// 日程安排类型定义
export interface Schedule {
  id: string;                // 日程唯一标识符
  title: string;             // 日程标题
  time: string;              // 时间（格式：HH:MM）
  date: string;              // 日期（格式：YYYY-MM-DD）
  description?: string;      // 描述（可选）
}

// 个人资料配置类型定义
export interface ProfileConfig {
  name: string;              // 姓名
  bio: string;               // 个人简介
  avatar: string;            // 头像 URL
  location?: string;         // 位置（可选）
  email?: string;            // 邮箱（可选）
  github?: string;           // GitHub 用户名（可选）
  twitter?: string;          // Twitter 用户名（可选）
  jobTitle?: string;         // 职位（可选）
  company?: string;          // 公司（可选）
  website?: string;          // 个人网站（可选）
  availableForHire?: boolean; // 是否可雇佣（可选）
  skills?: string[];         // 技能数组（可选）
  socials?: {                // 社交媒体链接（可选）
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  readme: string;            // README 内容（Markdown 格式）
}

// SEO 配置类型定义
export interface SeoConfig {
  siteTitle: string;         // 网站标题
  description: string;       // 网站描述
  keywords: string[];        // 关键词数组
  ogImage?: string;          // Open Graph 图片 URL（可选）
}

// SSO 配置类型定义
export interface SsoConfig {
  enabled: boolean;          // 是否启用 SSO
  providerName: string;      // SSO 提供商名称
  loginUrl: string;          // 登录 URL
}

// 站点配置类型定义
export interface SiteConfig {
  heroTitle: string;         // 首页标题
  heroSubtitle: string;      // 首页副标题
  heroImage: string;         // 首页背景图片 URL
  siteName: string;          // 网站名称
  logoUrl?: string;          // Logo URL（可选）
  icpNumber?: string;        // ICP 备案号（可选）
  themeColor?: string;       // 主题颜色（可选）
  profile: ProfileConfig;    // 个人资料配置
  friendLinks?: FriendLink[]; // 友情链接数组（可选）
  friendsMessage?: string;   // 友情链接页面消息（可选）
  sso?: SsoConfig;           // SSO 配置（可选）
  seo: SeoConfig;            // SEO 配置
}

// 视图模式类型定义
export type ViewMode = "home" | "categories" | "post" | "profile" | "friends" | "memos" | "dashboard" | "admin-login" | "admin-dashboard" | "admin-editor" | "settings";

// 预设主题颜色数组
export const PRESET_THEMES = [
  { name: "Cosmic Blue", color: "#007AFF" }, 
  { name: "Royal Purple", color: "#5856D6" }, 
  { name: "Titanium Gray", color: "#8E8E93" },
  { name: "Midnight", color: "#1c1c1e" }, 
  { name: "Sunset Gold", color: "#FF9500" }, 
  { name: "Ruby Red", color: "#FF2D55" }, 
  { name: "Teal Blue", color: "#30B0C7" }, 
  { name: "Emerald", color: "#34C759" }, 
];