
export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  tags: string[];
  category: string;
  author: string;
  comments?: Comment[];
  featured?: boolean;
  likes?: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  avatar?: string;
  replies?: Comment[];
}

export interface Memo {
  id: string;
  content: string;
  date: string;
  images?: string[];
  tags?: string[];
}

export interface FriendLink {
  id: string;
  name: string;
  url: string;
  avatar?: string;
  description?: string;
  category?: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  date: string; // YYYY-MM-DD
}

export interface Schedule {
  id: string;
  title: string;
  time: string; // HH:MM
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface ProfileConfig {
  name: string;
  bio: string;
  avatar: string;
  location?: string;
  email?: string;
  github?: string;
  twitter?: string;
  jobTitle?: string;
  company?: string;
  website?: string;
  availableForHire?: boolean;
  skills?: string[];
  socials?: {
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  readme: string; 
}

export interface SeoConfig {
  siteTitle: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface SsoConfig {
  enabled: boolean;
  providerName: string;
  loginUrl: string;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  siteName: string;
  logoUrl?: string;     
  icpNumber?: string;   
  themeColor?: string;  
  profile: ProfileConfig;
  friendLinks?: FriendLink[];
  friendsMessage?: string;
  sso?: SsoConfig;
  seo: SeoConfig;
}

export type ViewMode = "home" | "categories" | "post" | "profile" | "friends" | "memos" | "dashboard" | "admin-login" | "admin-dashboard" | "admin-editor" | "settings";

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