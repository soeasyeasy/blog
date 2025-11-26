import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 导出 Vite 配置
export default defineConfig(({ mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, '.', '');
    return {
      // 开发服务器配置
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      // 插件配置
      plugins: [react()],
      // 定义全局常量
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      // 环境变量配置
      envDir: '.',
      envPrefix: 'VITE_',
      // 路径解析配置
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});