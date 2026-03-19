import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, Mail, ShieldCheck, Check, Smartphone, ChevronLeft } from 'lucide-react';
import { authService } from '@/api/service/auth';
import { useUserStore } from '@/store/index';
import { Users } from '@/api/sql_models';
import { message } from '@/utils/pure/message';

export default function RegisterForm({ onSwitch, onBack }: { onSwitch: () => void; onBack: () => void; key?: string }) {
  const [tab, setTab] = useState<'phone' | 'email'>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const { loginAfterRegister } = useUserStore();

  const handleSendCode = async () => {
    const target = tab === 'phone' ? phone : email;
    if (!target) {
      message.error(tab === 'phone' ? '请输入手机号' : '请输入邮箱');
      return;
    }

    // 简单校验
    if (tab === 'phone' && !/^1[3-9]\d{9}$/.test(phone)) {
      message.error('请输入正确的手机号');
      return;
    }
    if (tab === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('请输入正确的邮箱');
      return;
    }

    try {
      const res = await authService.sendCode(target);
      if (res.success) {
        message.success('验证码已发送');
        setCountdown(60);
        setIsCounting(true);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              setIsCounting(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        message.error(res.msg || '发送失败');
      }
    } catch (error) {
      message.error('发送失败，请稍后重试');
    }
  };

  const handleRegister = async () => {
    if (!code) {
      message.error('请输入验证码');
      return;
    }
    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    if (!password || password.length < 6) {
      message.error('密码长度不能少于6位');
      return;
    }

    setIsLoading(true);
    try {
      const userData: Partial<Users> = {
        password: password,
      };

      if (tab === 'phone') {
        userData.phone = phone;
      } else {
        userData.email = email;
      }

      const res = await authService.register(userData as Users, code);
      if (res.success && res.data) {
        message.success('注册成功，欢迎加入！');
        setTimeout(() => {
          loginAfterRegister(res);
        }, 500);
      } else {
        message.error(res.msg || '注册失败，请稍后重试');
      }
    } catch (error) {
      console.error('Register error:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 p-8 flex flex-col h-full overflow-y-auto no-scrollbar"
    >
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="absolute top-8 left-8 p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="mt-12 mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">创建账户</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 transition-colors">开启你们的专属空间</p>
      </div>

      {/* Tabs */}
      <div className="w-full flex p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl mb-8 relative transition-colors">
        <div 
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-all duration-300 ease-out"
          style={{ left: tab === 'phone' ? '6px' : 'calc(50%)' }}
        />
        <button 
          onClick={() => setTab('phone')}
          className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${tab === 'phone' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          手机号
        </button>
        <button 
          onClick={() => setTab('email')}
          className={`flex-1 py-3 text-sm font-bold z-10 transition-colors ${tab === 'email' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          邮箱地址
        </button>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
        className="w-full flex flex-col h-full"
      >
        {/* Inputs */}
        <div className="w-full space-y-5">
          {tab === 'phone' ? (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                placeholder="请输入手机号码"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                placeholder="请输入邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="flex space-x-3">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="text"
                name="code"
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                placeholder="验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button 
              type="button"
              disabled={isCounting}
              className={`px-5 py-4 border rounded-2xl text-sm font-bold transition-colors whitespace-nowrap ${
                isCounting 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed' 
                : 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-500 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50'
              }`}
              onClick={handleSendCode}
            >
              {isCounting ? `${countdown}s 后重试` : '获取验证码'}
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              className="w-full pl-12 pr-12 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
              placeholder="设置密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              className="w-full pl-12 pr-12 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="w-full mt-6 mb-8 px-1">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
              <input type="checkbox" className="peer sr-only" required />
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-cyan-400 peer-checked:border-cyan-400 dark:peer-checked:bg-cyan-500 dark:peer-checked:border-cyan-500 transition-all flex items-center justify-center">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium transition-colors">
              我已阅读并同意 <a href="#" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">服务协议</a> 与 <a href="#" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">隐私政策</a>
            </span>
          </label>
        </div>

        {/* Register Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="w-full py-4 bg-linear-to-r from-cyan-400 to-blue-400 dark:from-cyan-500 dark:to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 transition-all mt-auto disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            '立即注册'
          )}
        </motion.button>
      </form>

      {/* Switch */}
      <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium pb-4 transition-colors">
        已经有账号了？ <button onClick={onSwitch} className="text-cyan-500 dark:text-cyan-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">登录</button>
      </div>
    </motion.div>
  );
}
