import React, { useState, useRef, useEffect } from 'react';

// --- 丰富的心情 Emoji 库 ---
const MOODS = [
  { id: 'calm', icon: '😐', label: '平静', color: 'text-emerald-500' },
  { id: 'happy', icon: '😊', label: '开心', color: 'text-amber-500' },
  { id: 'crush', icon: '💓', label: '心动', color: 'text-pink-500' },
  { id: 'love', icon: '😍', label: '超爱', color: 'text-rose-500' },
  { id: 'satisfied', icon: '😌', label: '满足', color: 'text-teal-500' },
  { id: 'excited', icon: '🤩', label: '兴奋', color: 'text-yellow-500' },
  { id: 'angry', icon: '😠', label: '生气', color: 'text-red-500' },
  { id: 'annoyed', icon: '😤', label: '烦躁', color: 'text-orange-500' },
  { id: 'sad', icon: '😢', label: '伤心', color: 'text-sky-500' },
  { id: 'sorrow', icon: '😭', label: '难过', color: 'text-blue-500' },
  { id: 'speechless', icon: '🙄', label: '无语', color: 'text-slate-500' },
  { id: 'tired', icon: '😴', label: '好累', color: 'text-indigo-500' }
];

// --- 模拟 4 月份数据 ---
const generateMonthDays = () => {
  const days = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date(2026, 3, i); // 2026年4月
    days.push({
      dateStr: `2026-04-${String(i).padStart(2, '0')}`,
      dayNum: i,
      dayOfWeek: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
    });
  }
  return days;
};

// 预设日记数据 (设定今天为 2026-04-13)
const TODAY = '2026-04-13';

const initialDiaries = [
  {
    id: 1, date: '2026-04-12', userId: 'alice', userName: 'Alice',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=fecdd3',
    mood: 'love', time: '21:30',
    content: '今天一起去看了心心念念的电影！男主太帅了，不过还是我家宝宝最帅啦 🎬✨ 晚上吃的烤肉也超级满足，这简直是完美的周末呀～',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=500&q=80',
    likes: 1, likedByMe: true, comments: [], isEdited: false
  },
  {
    id: 2, date: '2026-04-12', userId: 'bob', userName: 'Bob',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Bob&backgroundColor=bae6fd',
    mood: 'happy', time: '22:15',
    content: '烤肉真好吃，就是排队等了太久。看你开心我就开心！',
    image: null,
    likes: 1, likedByMe: false, comments: [
      { id: 101, userName: 'Alice', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=fecdd3', time: '22:20', content: '下次去吃不用排队的！' }
    ], isEdited: false
  }
];

// --- SVG 图标库 ---
const Icons = {
  heart: ({ status, className }) => {
    // 0 个日记：灰色空心爱心
    if (status === 'none') {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    }
    // 1 个日记：红色半填满爱心
    if (status === 'half') {
      return (
        <svg className={className} viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
                <linearGradient id="halfRed" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="transparent" />
                </linearGradient>
            </defs>
            <path fill="url(#halfRed)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    }
    // 2 个日记：红色实心爱心
    return (
        <svg className={className} viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
  },
  image: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  chat: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  send: () => <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>,
  heartIcon: ({ solid, className }) => <svg className={className} fill={solid ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
};

export default function MoodDiary() {
  const [darkMode, setDarkMode] = useState(false);
  const [diaries, setDiaries] = useState(initialDiaries);
  const [currentDate, setCurrentDate] = useState(TODAY); // 默认选中今天
  const monthDays = generateMonthDays();
  const calendarScrollRef = useRef(null);

  // 弹窗状态
  const [writeModal, setWriteModal] = useState(false);
  const [detailModalId, setDetailModalId] = useState(null);
  
  // 评论输入
  const [commentText, setCommentText] = useState('');

  // 写日记/编辑表单状态
  const [newDiary, setNewDiary] = useState({ id: null, mood: null, content: '', image: null });

  // 假设当前用户是男生 (Bob)
  const currentUser = 'bob';
  const currentUserName = 'Bob';
  const currentUserAvatar = 'https://api.dicebear.com/7.x/notionists/svg?seed=Bob&backgroundColor=bae6fd';
  const isMale = currentUser === 'bob';

  // 动态主题配色 (男生蓝，女生粉)
  const themeBgClass = isMale ? 'bg-sky-500' : 'bg-rose-500';
  const themeShadowClass = isMale ? 'shadow-sky-500/30' : 'shadow-rose-500/30';
  const themeRingClass = isMale ? 'ring-sky-400' : 'ring-rose-400';
  const themeTextClass = isMale ? 'text-sky-500' : 'text-rose-500';

  // 初始化滚动到选中日期
  useEffect(() => {
    if (calendarScrollRef.current) {
      const activeEl = calendarScrollRef.current.querySelector('.active-day');
      if (activeEl) {
        calendarScrollRef.current.scrollTo({
          left: activeEl.offsetLeft - calendarScrollRef.current.offsetWidth / 2 + 30,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // 获取特定日期的状态 (none, half, both)
  const getDayStatus = (dateStr) => {
    const hasAlice = diaries.some(d => d.date === dateStr && d.userId === 'alice');
    const hasBob = diaries.some(d => d.date === dateStr && d.userId === 'bob');
    if (hasAlice && hasBob) return 'both';
    if (hasAlice || hasBob) return 'half';
    return 'none';
  };

  // 当前选中日期下的日记
  const selectedDiaries = diaries.filter(d => d.date === currentDate);
  // 当前用户今天是否已经写过
  const hasWrittenToday = diaries.some(d => d.date === currentDate && d.userId === currentUser);

  // --- 交互处理 ---
  const handleLike = (id) => {
    setDiaries(diaries.map(d => {
      if (d.id === id) {
        return { ...d, likedByMe: !d.likedByMe, likes: d.likedByMe ? d.likes - 1 : d.likes + 1 };
      }
      return d;
    }));
  };

  const handleSendComment = (diaryId) => {
    if (!commentText.trim()) return;
    setDiaries(diaries.map(d => {
      if (d.id === diaryId) {
        return {
          ...d,
          comments: [...d.comments, { id: Date.now(), userName: currentUserName, avatar: currentUserAvatar, time: '刚刚', content: commentText }]
        };
      }
      return d;
    }));
    setCommentText('');
  };

  const handleEditDiary = (diary) => {
    setNewDiary({
      id: diary.id,
      mood: diary.mood,
      content: diary.content,
      image: diary.image
    });
    setDetailModalId(null);
    setWriteModal(true);
  };

  const handleSaveDiary = () => {
    if (!newDiary.mood) return alert('请选择一个心情哦！');

    if (newDiary.id) {
      // 修改现有的日记
      setDiaries(diaries.map(d => {
        if (d.id === newDiary.id) {
          return {
            ...d,
            mood: newDiary.mood,
            content: newDiary.content,
            image: newDiary.image,
            isEdited: true // 标记为已修改
          };
        }
        return d;
      }));
    } else {
      // 新增日记
      const entry = {
        id: Date.now(),
        date: currentDate,
        userId: currentUser,
        userName: currentUserName,
        avatar: currentUserAvatar,
        mood: newDiary.mood,
        time: '刚刚',
        content: newDiary.content,
        image: newDiary.image,
        likes: 0,
        likedByMe: false,
        comments: [],
        isEdited: false
      };
      setDiaries([...diaries, entry]);
    }

    setWriteModal(false);
    setNewDiary({ id: null, mood: null, content: '', image: null });
  };

  const activeDiary = diaries.find(d => d.id === detailModalId);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="w-full max-w-[400px] mx-auto h-screen relative flex flex-col font-sans overflow-hidden sm:border-x sm:border-slate-200 dark:sm:border-slate-800 sm:shadow-2xl transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
        
        {/* ================= 背景光效 ================= */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/60 to-transparent dark:from-slate-900/60 z-0"></div>
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-rose-200/40 dark:bg-rose-900/30 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-sky-200/40 dark:bg-sky-900/30 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>
        </div>

        {/* ================= 头部导航 ================= */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-center relative z-20 transition-colors duration-500">
          <button className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-[17px] font-extrabold text-slate-800 dark:text-white tracking-wide">2026年 4月</h1>
          </div>
          
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </header>

        {/* ================= 顶部日历滑块 (Calendar Slider) ================= */}
        <div className="relative z-20  transition-colors">
          {/* 增加了 py-4 以防止上下放大时被截断 */}
          <div ref={calendarScrollRef} className="flex overflow-x-auto no-scrollbar px-4 py-4 space-x-3 snap-x scroll-smooth">
            {monthDays.map((day) => {
              const isSelected = day.dateStr === currentDate;
              const status = getDayStatus(day.dateStr);
              
              return (
                <div 
                  key={day.dateStr}
                  onClick={() => setCurrentDate(day.dateStr)}
                  className={`snap-center shrink-0 w-[52px] h-[72px] rounded-[1.25rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? `${themeBgClass} text-white shadow-lg ${themeShadowClass} scale-105 active-day` 
                      : 'bg-white/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold tracking-widest ${isSelected ? 'opacity-80' : 'opacity-60'}`}>{day.dayOfWeek}</span>
                  <span className="text-[17px] font-black my-0.5">{day.dayNum}</span>
                  {/* 使用自定义状态的爱心 */}
                  <Icons.heart status={status} className={`w-4 h-4 transition-all ${isSelected && status === 'none' ? 'text-white/60' : ''}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 下半部日记卡片列表 ================= */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-24 relative z-10">
          
          <div className="flex items-center justify-center mb-6">
            <div className="px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/50 dark:border-slate-700 text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-widest shadow-sm">
              {currentDate.replace(/-/g, ' . ')}
            </div>
          </div>

          {selectedDiaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 opacity-60 animate-fade-in-up">
              <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <p className="text-sm font-bold text-slate-400">今天还没有人写日记哦</p>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedDiaries.map((diary, index) => {
                const isGirl = diary.userId === 'alice';
                const moodObj = MOODS.find(m => m.id === diary.mood) || MOODS[0];
                
                return (
                  <div 
                    key={diary.id} 
                    onClick={() => setDetailModalId(diary.id)}
                    className={`relative bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-[2rem] p-5 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-none animate-fade-in-up ${
                      isGirl ? 'shadow-rose-200/20' : 'shadow-sky-200/20'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img src={diary.avatar} alt="avatar" className={`w-10 h-10 rounded-full border border-white/80 dark:border-slate-700 shadow-sm ${isGirl ? 'bg-rose-100' : 'bg-sky-100'}`} />
                        <div>
                          <h3 className={`text-[14px] font-extrabold ${isGirl ? 'text-rose-500 dark:text-rose-400' : 'text-sky-500 dark:text-sky-400'}`}>{diary.userName}</h3>
                          <p className="text-[10px] font-medium text-slate-400">{diary.time}</p>
                        </div>
                      </div>
                      {/* 心情 Tag */}
                      <div className={`px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-white dark:border-slate-600 flex items-center space-x-1.5 shadow-sm`}>
                        <span className="text-lg leading-none">{moodObj.icon}</span>
                        <span className={`text-[11px] font-extrabold ${moodObj.color}`}>{moodObj.label}</span>
                      </div>
                    </div>
                    
                    {/* 文本内容: 限制 2 行 */}
                    {diary.content && (
                      <p className="text-[14px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium line-clamp-2 mb-3">
                        {diary.content}
                      </p>
                    )}

                    {/* 有图片时的缩略图提示 */}
                    {diary.image && (
                      <div className="w-full h-24 rounded-2xl overflow-hidden relative">
                        <img src={diary.image} alt="diary-img" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                           <span className="bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-bold">查看图片</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= 悬浮写日记按钮 (FAB) 根据男女变换颜色 ================= */}
        {!hasWrittenToday && (
          <button 
            onClick={() => {
              setNewDiary({ id: null, mood: null, content: '', image: null });
              setWriteModal(true);
            }}
            className={`absolute bottom-8 right-6 w-14 h-14 ${themeBgClass} text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl ${themeShadowClass} hover:scale-110 active:scale-95 transition-transform z-30 animate-bounce-slow`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        )}

        {/* ================= 弹窗 1: 写日记/修改日记 Modal ================= */}
        {writeModal && (
          <div className="absolute inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden animate-slide-up transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-slate-900 dark:to-slate-900 z-0"></div>
            
            <header className="px-6 pt-12 pb-4 flex justify-between items-center relative z-20 border-b border-white/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
              <button onClick={() => setWriteModal(false)} className="text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-white transition-colors">取消</button>
              <h2 className="text-[17px] font-extrabold text-slate-800 dark:text-white">
                {newDiary.id ? '修改日记' : currentDate.replace(/-/g, '.')}
              </h2>
              <button onClick={handleSaveDiary} className={`${themeTextClass} font-extrabold transition-colors`}>保存</button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-12 relative z-10 space-y-8">
              
              {/* 心情选择 */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-1">今日心情 (必选)</label>
                {/* 增加 px-2 和 py-3 防止放大时被裁切 */}
                <div className="flex space-x-3 overflow-x-auto no-scrollbar py-3 px-2 -mx-2">
                  {MOODS.map(mood => (
                    <button 
                      key={mood.id}
                      onClick={() => setNewDiary({...newDiary, mood: mood.id})}
                      className={`shrink-0 w-14 h-16 rounded-[1.25rem] flex flex-col items-center justify-center transition-all ${
                        newDiary.mood === mood.id 
                          ? `bg-white dark:bg-slate-800 shadow-md ring-2 ${themeRingClass} scale-110` 
                          : 'bg-white/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border border-white dark:border-slate-700 hover:bg-white/80'
                      }`}
                    >
                      <span className="text-2xl mb-1">{mood.icon}</span>
                      <span className={`text-[9px] font-bold ${newDiary.mood === mood.id ? mood.color : ''}`}>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 正文输入 */}
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-[2rem] p-5 shadow-sm">
                <textarea 
                  rows="8"
                  placeholder="记录下今天的点点滴滴..."
                  value={newDiary.content}
                  onChange={e => setNewDiary({...newDiary, content: e.target.value})}
                  className="w-full bg-transparent text-[15px] font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
                ></textarea>
                
                {/* 图片上传占位 */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="w-20 h-20 rounded-[1.25rem] bg-slate-100 dark:bg-slate-700/50 border border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Icons.image />
                    <span className="text-[9px] font-bold mt-1">添加照片</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= 弹窗 2: 详情与评论 Modal ================= */}
        {detailModalId && activeDiary && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setDetailModalId(null)}></div>
            
            <div className="relative w-full h-[85vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:border-t dark:border-slate-700/50 flex flex-col overflow-hidden animate-slide-up sm:max-w-[400px] sm:mx-auto">
              
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
                <div className="w-12"></div> {/* 左侧占位保持居中 */}
                <div className="text-center flex-1">
                   <h2 className="text-[15px] font-extrabold text-slate-800 dark:text-white">{activeDiary.date.replace(/-/g, '.')}</h2>
                   <p className="text-[10px] font-bold text-slate-400 mt-0.5">{activeDiary.userName} 的日记</p>
                </div>
                <div className="w-12 flex justify-end items-center">
                  {/* 当日且属于自己且未修改过，则显示修改按钮 */}
                  {activeDiary.date === TODAY && activeDiary.userId === currentUser && !activeDiary.isEdited && (
                     <button onClick={() => handleEditDiary(activeDiary)} className={`mr-3 text-[13px] font-bold ${themeTextClass}`}>修改</button>
                  )}
                  <button onClick={() => setDetailModalId(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Icons.close />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
                
                {/* 详情头部 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <img src={activeDiary.avatar} alt="avatar" className={`w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${activeDiary.userId==='alice' ? 'bg-rose-100' : 'bg-sky-100'}`} />
                    <div>
                        <span className="block text-[11px] font-medium text-slate-400">{activeDiary.time}</span>
                        {activeDiary.isEdited && <span className="text-[9px] text-slate-300 dark:text-slate-600">(已修改)</span>}
                    </div>
                  </div>
                  <div className="text-4xl drop-shadow-md">
                    {(MOODS.find(m => m.id === activeDiary.mood) || MOODS[0]).icon}
                  </div>
                </div>

                {/* 正文 */}
                {activeDiary.content && (
                  <p className="text-[15px] text-slate-800 dark:text-slate-100 leading-loose font-medium mb-6 whitespace-pre-wrap">
                    {activeDiary.content}
                  </p>
                )}

                {/* 图片 */}
                {activeDiary.image && (
                  <div className="w-full rounded-[2rem] overflow-hidden mb-6 shadow-md border border-white/20">
                    <img src={activeDiary.image} alt="diary-img" className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* 评论区界线 */}
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-6"></div>

                {/* 评论列表 */}
                <div className="space-y-5 pb-6">
                  <h3 className="text-[12px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">评论 ({activeDiary.comments.length})</h3>
                  {activeDiary.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium text-center py-4 opacity-60">还没有评论哦，快来说点什么吧~</p>
                  ) : (
                    activeDiary.comments.map(c => {
                      const isGirl = c.userName === 'Alice';
                      const nameColor = isGirl ? 'text-rose-500 dark:text-rose-400' : 'text-sky-500 dark:text-sky-400';
                      return (
                        <div key={c.id} className="flex items-start gap-3">
                          <img src={c.avatar} alt="avatar" className={`w-8 h-8 rounded-full ${isGirl ? 'bg-rose-100' : 'bg-sky-100'}`} />
                          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl rounded-tl-sm p-3 border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className={`text-xs font-extrabold ${nameColor}`}>{c.userName}</span>
                              <span className="text-[9px] font-medium text-slate-400">{c.time}</span>
                            </div>
                            <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{c.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 底部交互与输入区 */}
              <div className="shrink-0 px-4 pb-6 pt-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex items-end gap-3">
                <button 
                  onClick={() => handleLike(activeDiary.id)}
                  className={`shrink-0 flex items-center justify-center gap-1.5 h-11 px-4 rounded-full border transition-all ${
                    activeDiary.likedByMe 
                      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-500' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icons.heartIcon solid={activeDiary.likedByMe} className={`w-5 h-5 ${activeDiary.likedByMe ? 'text-rose-500' : ''}`} />
                  <span className="text-[13px] font-bold">{activeDiary.likes > 0 ? activeDiary.likes : '赞'}</span>
                </button>

                <div className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-[1.5rem] relative overflow-hidden flex items-center">
                  <input 
                    type="text"
                    placeholder="写评论..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendComment(activeDiary.id);
                      }
                    }}
                  />
                  <button 
                    onClick={() => handleSendComment(activeDiary.id)}
                    disabled={!commentText.trim()}
                    className="shrink-0 p-2 mr-1 text-sky-500 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Icons.send />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= 全局样式与动画 ================= */}
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar { display: none !important; }
          .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          @keyframes bounceSlow {
            0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
            50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
          }
          .animate-bounce-slow { animation: bounceSlow 2s infinite; }
        `}} />
      </div>
    </div>
  );
}