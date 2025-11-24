
import React, { useState } from "react";
import { Settings } from "lucide-react";

export const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "apple") {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center h-[70vh] animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg">
            <Settings className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#1D1D1F]">Admin Access</h2>
          <p className="text-gray-400 text-sm mt-2">请输入密码 (apple) 以继续管理。</p>
        </div>
        
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
