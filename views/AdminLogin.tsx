/**
 * 管理员登录视图组件
 * 提供管理员登录界面，验证密码后进入管理后台
 */

import React, { useState } from "react";
// 导入图标组件
import { Settings } from "lucide-react";

// 管理员登录视图组件属性接口
export const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  // 状态管理：密码和错误状态
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  /**
   * 处理表单提交
   * @param e 表单事件
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 简单密码验证（实际应用中应使用更安全的认证方式）
    if (password === "apple") {
      onLogin();
    } else {
      setError(true);
      // 2秒后清除错误状态
      setTimeout(() => setError(false), 2000);
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
          <p className="text-gray-400 text-sm mt-2">请输入密码 (apple) 以继续管理。</p>
        </div>
        
        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-gray-50 border ${error ? "border-red-500 bg-red-50" : "border-transparent hover:bg-gray-100"} rounded-xl px-4 py-4 text-center text-[#1D1D1F] font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 transition-all duration-300 placeholder-gray-400`}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-[#0071e3]/30 transition-all duration-300 active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};