import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, Check, Heart, MessageCircle, ChevronLeft } from 'lucide-react';
import { useUserStore } from '@/store';
export default function LoginForm({ onSwitch, onBack, onLogin }: { onSwitch: () => void; onBack: () => void; onLogin: () => void; key?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);
  const { login } = useUserStore();

  const handleLogin = async () => {
     if (await login(username, password)) {
      if(rememberPassword) {
        localStorage.setItem('rememberPassword', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
      } else {
        localStorage.removeItem('rememberPassword');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
      }
      onLogin();
     }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  useEffect(() => {
    if(localStorage.getItem('rememberPassword') === 'true') {
      setRememberPassword(true);
      setUsername(localStorage.getItem('username') || '');
      setPassword(localStorage.getItem('password') || '');
    }
  }, []);

  useEffect(() => {
    if(rememberPassword) {
      localStorage.setItem('rememberPassword', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
    } else {
      localStorage.removeItem('rememberPassword');
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }
  }, [rememberPassword]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 pt-10 pb-4 px-6 flex flex-col items-center justify-center h-full"
    >
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="absolute top-12 left-8 p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Logo */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
        className="w-24 h-24 bg-linear-to-tr from-cyan-300 to-blue-300 rounded-4xl shadow-xl shadow-cyan-200/50 dark:shadow-cyan-900/50 flex items-center justify-center mb-8 relative"
      >
        <Heart className="text-white w-12 h-12 fill-white" />
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-pink-300 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-sm transition-colors">
          <User className="text-white w-5 h-5" />
        </div>
      </motion.div>

      <div className="text-center mb-10 w-full">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight transition-colors">欢迎回来</h1>

        <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-medium transition-colors">Today: {new Date().toLocaleDateString('zh-CN').replace(/\//g, '.')}</p>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="w-full flex flex-col items-center"
      >
        {/* Inputs */}
        <div className="w-full space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
              placeholder="用户名 / 邮箱"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
              placeholder="请输入密码"
              onKeyDown={ handleKeyDown }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="w-full flex items-center justify-between mt-5 mb-8 px-1">
          <label className="flex items-center space-x-2 cursor-pointer group">
            
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className="peer sr-only" onClick={() => setRememberPassword(!rememberPassword)} />
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-cyan-400 peer-checked:border-cyan-400 dark:peer-checked:bg-cyan-500 dark:peer-checked:border-cyan-500 transition-all flex items-center justify-center">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
              
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors font-medium">记住密码</span>
          </label>
          <button type="button" className="text-sm text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors font-medium">忘记密码?</button>
        </div>

        {/* Login Button */}
        <motion.button 
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-linear-to-r from-cyan-400 to-blue-400 dark:from-cyan-500 dark:to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 transition-all"
        >
          立即登录
        </motion.button>
      </form>

      {/* Third Party */}
      <div className="w-full mt-10">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700 transition-colors"></div>
          </div>
          <span className="relative px-4 bg-transparent text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wider">第三方登录</span>
        </div>
        <div className="flex justify-center space-x-6">
          <button className="w-12 h-12 rounded-full border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:scale-110 hover:shadow-md transition-all text-[#07C160]">
            <MessageCircle className="w-6 h-6 fill-current" />
          </button>
          <button className="w-12 h-12 rounded-full border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:scale-110 hover:shadow-md transition-all text-slate-800 dark:text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" /></svg>
          </button>
          <button className="w-12 h-12 rounded-full border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:scale-110 hover:shadow-md transition-all text-[#12B7F5]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" /></svg>
          </button>
        </div>
      </div>

      {/* Switch */}
      <div className="mt-auto pt-8 text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">
        还没有账户？ <button onClick={onSwitch} className="text-cyan-500 dark:text-cyan-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">立即注册</button>
      </div>
    </motion.div>
  );
}
