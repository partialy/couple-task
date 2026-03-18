import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Ticket, X, Clock, Info, CheckCircle2 } from 'lucide-react';
import { SpecialItem, specialIconMap, specialColorStyles } from './types';

interface RedeemTabProps {
  specialItems: SpecialItem[];
  key?: string;
}

export default function RedeemTab({ specialItems }: RedeemTabProps) {
  const activeItems = specialItems.filter(item => item.status !== 'inactive');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showHowToGetModal, setShowHowToGetModal] = useState(false);

  // Mock records data
  const mockRecords = [
    { id: 1, type: 'task', title: '完成连续打卡7天', date: '2026-03-08 10:30', amount: '+1' },
    { id: 2, type: 'code', title: '使用兑换码: SPRING2026', date: '2026-03-05 14:20', amount: '+2' },
    { id: 3, type: 'redeem', title: '兑换特别奖励: 游乐园门票', date: '2026-03-01 09:15', amount: '-2' },
  ];

  return (
    <motion.div
      key="special-redeem-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-3 py-6"
    >
      {/* Cards Balance Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-300/40 dark:shadow-indigo-900/40 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-1">
            <Ticket className="w-4 h-4 text-indigo-200" />
            <p className="text-white/80 text-sm font-medium">万能兑换卡余额</p>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black">3</span>
            <span className="text-sm font-bold">张</span>
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            <button 
              onClick={() => setShowRecordModal(true)}
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm outline-none focus:outline-none"
            >
              获取记录
            </button>
            <button 
              onClick={() => setShowHowToGetModal(true)}
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm outline-none focus:outline-none"
            >
              如何获取?
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 px-1">特别奖励</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {activeItems.map(item => {
          const IconComponent = specialIconMap[item.icon] || Star;
          const colorKey = Object.keys(specialColorStyles).find(k => specialColorStyles[k].bg === item.color) || 'indigo';
          
          return (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm flex items-center space-x-4 relative overflow-hidden group border border-slate-100 dark:border-slate-700/50">
              <div className={`w-20 h-20 rounded-2xl ${item.color} flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden`}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <IconComponent className={`w-10 h-10 ${specialColorStyles[colorKey]?.text || 'text-indigo-500'}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 dark:text-white mb-1 text-base truncate">{item.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">{item.desc}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-black text-indigo-500">{item.cards}</span>
                    <span className="text-[10px] font-bold text-slate-400">张万能卡</span>
                  </div>
                  <button className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors text-xs shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 outline-none focus:outline-none">
                    立即兑换
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {activeItems.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
            <Star className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400">暂无特殊奖励</p>
          </div>
        )}
      </div>

      {/* Record Modal */}
      <AnimatePresence>
        {showRecordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowRecordModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">获取记录</h3>
                </div>
                <button 
                  onClick={() => setShowRecordModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors outline-none focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {mockRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm mb-1">{record.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{record.date}</p>
                      </div>
                      <div className={`font-black text-lg ${record.amount.startsWith('+') ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {record.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 pt-0">
                <button 
                  onClick={() => setShowRecordModal(false)}
                  className="w-full py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors outline-none focus:outline-none"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* How to Get Modal */}
      <AnimatePresence>
        {showHowToGetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowHowToGetModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <Info className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">如何获取万能卡？</h3>
                </div>
                <button 
                  onClick={() => setShowHowToGetModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors outline-none focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                      完成特殊任务
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      完成带有“万能卡”标记的特殊任务，即可获得万能兑换卡。例如连续打卡、达成特定成就等。
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center text-base">
                      <Ticket className="w-5 h-5 text-indigo-500 mr-2" />
                      使用兑换码
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      在特定节日或活动期间，家长可能会发放包含万能兑换卡的兑换码，输入即可领取。
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-0">
                <button 
                  onClick={() => setShowHowToGetModal(false)}
                  className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 outline-none focus:outline-none"
                >
                  我知道了
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
