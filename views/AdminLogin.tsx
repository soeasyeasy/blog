/**
 * 管理员登录视图组件
 * 提供管理员登录界面，验证密码后进入管理后台
 */

import React, { useState } from "react";
// 导入图标组件
import { Settings } from "lucide-react";
import { sha256 } from "../lib/utils";

// 管理员登录视图组件属性接口
export const AdminLogin = ({ onLogin }: { onLogin: (token: string) => void }) => {
  // 状态管理：用户名、密码和错误状态
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   * @param e 表单事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    try {
      // 对密码进行哈希处理
      const hashedPassword = await sha256(password);
      
      // 调用后端登录接口
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: hashedPassword }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLogin(data.token);
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[70vh] animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          {/* 图标和标题 */}
          <div className="w-16 h-16 bg-black text-white rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg">
            <Settings className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#1D1D1F]">Admin Access</h2>
          <p className="text-gray-400 text-sm mt-2">请输入用户名和密码以继续管理。</p>
        </div>
        
        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full bg-gray-50 border ${error ? "border-red-500 bg-red-50" : "border-transparent hover:bg-gray-100"} rounded-xl px-4 py-4 text-center text-[#1D1D1F] font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 transition-all duration-300 placeholder-gray-400`}
              disabled={loading}
            />
          </div>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-gray-50 border ${error ? "border-red-500 bg-red-50" : "border-transparent hover:bg-gray-100"} rounded-xl px-4 py-4 text-center text-[#1D1D1F] font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 transition-all duration-300 placeholder-gray-400`}
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-[#0071e3]/30 transition-all duration-300 active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};