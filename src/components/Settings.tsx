import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Bell, HelpCircle, Info, LogOut, ChevronRight, Smartphone, Moon, Globe } from 'lucide-react';
import ProfileEdit from './profile/ProfileEdit';
import { useUserStore } from '@/store';
import eventBus from '@/utils/eventBus';
import PageHeader from './ui/PageHeader';

export default function Settings({ onBack }: { onBack: () => void, key?: string }) {
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const clearCache = () => {
    eventBus.emit('LOGOUT');
    // @ts-ignore
    if(window.AndroidBridge) {
      // @ts-ignore
      window.AndroidBridge.clearCache();
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col"
    >
      <PageHeader title="设置" onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-3 space-y-8 no-scrollbar">
        {/* Account Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">账号设置</h3>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-sm">
            <SettingItem 
              icon={<User className="w-5 h-5 text-blue-500" />} 
              title="个人信息" 
              onClick={() => setShowProfileEdit(true)}
            />
            <SettingItem icon={<Smartphone className="w-5 h-5 text-emerald-500" />} title="账号与绑定" />
            <SettingItem icon={<Shield className="w-5 h-5 text-purple-500" />} title="隐私设置" />
          </div>
        </section>

        {/* App Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">应用设置</h3>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-sm">
            <SettingItem icon={<Bell className="w-5 h-5 text-orange-500" />} title="消息通知" />
            <SettingItem icon={<Moon className="w-5 h-5 text-indigo-500" />} title="深色模式" />
            <SettingItem icon={<Globe className="w-5 h-5 text-cyan-500" />} title="语言设置" />
          </div>
        </section>

        {/* Support Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">支持与关于</h3>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-sm">
            <SettingItem icon={<HelpCircle className="w-5 h-5 text-slate-500" />} title="帮助与反馈" />
            <SettingItem icon={<Info className="w-5 h-5 text-slate-500" />} title="关于我们" />
            <SettingItem icon={<Info className="w-5 h-5 text-red-500" />} title="清除缓存" onClick={() => clearCache()} />
          </div>
        </section>

        {/* Logout Button */}
        <div className="pt-8 pb-12">
          <button 
            onClick={() => eventBus.emit("LOGOUT")}
            className="w-full py-4 bg-white dark:bg-slate-800 text-rose-500 font-bold rounded-2xl shadow-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center space-x-2 border border-slate-100 dark:border-slate-700"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
          <p className="text-center text-slate-400 dark:text-slate-600 text-xs mt-6 font-medium">
            版本 1.0.0 (Build 20260322)
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showProfileEdit && (
          <ProfileEdit onBack={() => setShowProfileEdit(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SettingItem({ icon, title, value, onClick }: { icon: React.ReactNode, title: string, value?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
          {icon}
        </div>
        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      <div className="flex items-center space-x-2">
        {value && <span className="text-sm text-slate-400 dark:text-slate-500">{value}</span>}
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </button>
  );
}
