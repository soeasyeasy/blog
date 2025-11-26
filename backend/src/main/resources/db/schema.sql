-- BlogOS Database Schema for MySQL

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt VARCHAR(1000),
    content TEXT,
    cover_image VARCHAR(255),
    date VARCHAR(255),
    category VARCHAR(255),
    author VARCHAR(255),
    featured BOOLEAN DEFAULT FALSE,
    likes INT DEFAULT 0
);

-- 文章标签表
CREATE TABLE IF NOT EXISTS post_tags (
    post_id VARCHAR(255),
    tag VARCHAR(255),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255),
    parent_id VARCHAR(255) NULL,
    author VARCHAR(255),
    content TEXT,
    date VARCHAR(255),
    avatar VARCHAR(255),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 随手记表
CREATE TABLE IF NOT EXISTS memos (
    id VARCHAR(255) PRIMARY KEY,
    content TEXT,
    date VARCHAR(255)
);

-- 随手记图片表
CREATE TABLE IF NOT EXISTS memo_images (
    memo_id VARCHAR(255),
    image_url VARCHAR(255),
    FOREIGN KEY (memo_id) REFERENCES memos(id) ON DELETE CASCADE
);

-- 随手记标签表
CREATE TABLE IF NOT EXISTS memo_tags (
    memo_id VARCHAR(255),
    tag VARCHAR(255),
    FOREIGN KEY (memo_id) REFERENCES memos(id) ON DELETE CASCADE
);

-- 待办事项表
CREATE TABLE IF NOT EXISTS todos (
    id VARCHAR(255) PRIMARY KEY,
    text TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(50),
    date VARCHAR(255)
);

-- 日程安排表
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255),
    time VARCHAR(255),
    date VARCHAR(255),
    description TEXT
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'default',
    config_json TEXT
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化
CREATE INDEX idx_posts_date ON posts(date);
CREATE INDEX idx_posts_featured ON posts(featured);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_memos_date ON memos(date);
CREATE INDEX idx_todos_date ON todos(date);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_schedules_date ON schedules(date);