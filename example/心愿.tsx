import React, { useState, useEffect, useRef } from 'react';

// --- 模拟数据 ---
const initialAliceStars = [
  { id: 1, color: 'text-rose-400', content: '希望周末能一起去看海！' },
  { id: 2, color: 'text-pink-400', content: '想吃城东新开的那家火锅~' },
  { id: 3, color: 'text-amber-400', content: '要一个大大的拥抱！' },
  { id: 4, color: 'text-rose-500', content: '下个月去游乐园玩吧' },
  { id: 5, color: 'text-purple-400', content: '帮我清空一次购物车哈哈' },
];

const initialBobStars = [
  { id: 6, color: 'text-sky-400', content: '想要那个新出的游戏手柄' },
  { id: 7, color: 'text-blue-400', content: '这周末我做饭，想吃什么？' },
];

// --- 流星雨背景组件 (Canvas) ---
const MeteorBackground = ({ darkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let w, h;
    let meteors = [];

    const resize = () => {
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // 生成单颗流星 (降低速度，拉长轨迹)
    const createMeteor = () => ({
      x: Math.random() * w * 1.5, 
      y: Math.random() * -h,      
      length: 100 + Math.random() * 120, // 更长的拖尾
      speed: 1.5 + Math.random() * 2.5,  // 更慢的速度
      opacity: 1,
      angle: Math.PI / 4, 
    });

    // 初始化 7 颗流星
    for (let i = 0; i < 7; i++) meteors.push(createMeteor());

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      
      // 开启发光效果，使路径更明显
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';

      meteors.forEach(m => {
        // 向左下方移动
        m.x -= m.speed;
        m.y += m.speed;
        m.opacity -= 0.0025; // 渐隐速度更慢

        // 重置流星
        if (m.opacity <= 0 || m.x < -m.length || m.y > h + m.length) {
          Object.assign(m, createMeteor());
        }

        // 绘制流星拖尾渐变 (头部最亮，尾部渐隐)
        const grad = ctx.createLinearGradient(m.x, m.y, m.x + m.length, m.y - m.length);
        const color = darkMode ? '255,255,255' : '255,255,255';
        grad.addColorStop(0, `rgba(${color}, ${m.opacity})`);
        grad.addColorStop(1, `rgba(${color}, 0)`);

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + m.length, m.y - m.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2; // 稍微加粗
        ctx.stroke();
      });

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [darkMode]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// --- 圆柱形玻璃许愿瓶组件 (Canvas) ---
const CanvasCylinderBottle = ({ starsData, isLeft }) => {
  const canvasRef = useRef(null);

  const [visualStars, setVisualStars] = useState([]);

  useEffect(() => {
    let count = Math.max(3, Math.min(10, starsData.length === 0 ? 3 : starsData.length));
    const generated = [];
    const basePalette = isLeft 
      ? ['#fb7185', '#f472b6', '#fbbf24', '#f43f5e', '#c084fc'] // 粉色系
      : ['#38bdf8', '#60a5fa', '#818cf8', '#2dd4bf', '#a78bfa']; // 蓝色系

    for (let i = 0; i < count; i++) {
      let hexColor = basePalette[Math.floor(Math.random() * basePalette.length)];
      if (starsData[i]) {
        const c = starsData[i].color;
        if (c.includes('rose')) hexColor = '#fb7185';
        else if (c.includes('pink')) hexColor = '#f472b6';
        else if (c.includes('amber')) hexColor = '#fbbf24';
        else if (c.includes('sky')) hexColor = '#38bdf8';
        else if (c.includes('blue')) hexColor = '#60a5fa';
        else if (c.includes('indigo')) hexColor = '#818cf8';
        else if (c.includes('teal')) hexColor = '#2dd4bf';
        else if (c.includes('purple')) hexColor = '#c084fc';
      }

      generated.push({
        x: (Math.random() - 0.5) * 70, // 横向分布在圆柱肚子里
        y: (Math.random() - 0.5) * 80 + 20, // 纵向分布偏底部
        size: 5 + Math.random() * 4.5,
        angle: Math.random() * Math.PI * 2,
        color: hexColor,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        va: (Math.random() - 0.5) * 0.04 
      });
    }
    setVisualStars(generated);
  }, [starsData, isLeft]);

  // 绘制单颗小星星实体
  const drawInternalStar = (ctx, x, y, radius, angle, color) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / 5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos(rot) * radius, Math.sin(rot) * radius);
      rot += step;
      ctx.lineTo(Math.cos(rot) * (radius * 0.45), Math.sin(rot) * (radius * 0.45));
      rot += step;
    }
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    if (visualStars.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 10; 

      // 1. 物理计算: 漂浮在圆柱形瓶内
      visualStars.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.angle += s.va;
        
        // 圆柱形边界碰撞
        if (s.x > 38) { s.x = 38; s.vx *= -1; }
        if (s.x < -38) { s.x = -38; s.vx *= -1; }
        if (s.y > 65) { s.y = 65; s.vy *= -1; }
        if (s.y < -35) { s.y = -35; s.vy *= -1; }
      });

      // 2. 绘制软木塞
      ctx.fillStyle = 'rgba(120, 60, 20, 0.9)';
      ctx.beginPath();
      // 支持 roundRect 的现代写法
      if(ctx.roundRect) {
         ctx.roundRect(cx - 15, cy - 105, 30, 20, 4);
      } else {
         ctx.rect(cx - 15, cy - 105, 30, 20);
      }
      ctx.fill();
      
      ctx.fillStyle = 'rgba(160, 80, 30, 0.95)';
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(cx - 18, cy - 110, 36, 10, 3);
      else ctx.rect(cx - 18, cy - 110, 36, 10);
      ctx.fill();
      
      // 软木塞高光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(cx - 10, cy - 108, 20, 3, 2);
      else ctx.rect(cx - 10, cy - 108, 20, 3);
      ctx.fill();

      // 3. 绘制玻璃瓶颈背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(cx - 18, cy - 90, 36, 25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 90);
      ctx.lineTo(cx - 18, cy - 65);
      ctx.moveTo(cx + 18, cy - 90);
      ctx.lineTo(cx + 18, cy - 65);
      ctx.stroke();

      // 4. 绘制悬浮小星星
      ctx.save();
      ctx.translate(cx, cy); 
      visualStars.forEach(s => drawInternalStar(ctx, s.x, s.y, s.size, s.angle, s.color));
      ctx.restore();

      // 5. 绘制圆柱形玻璃主瓶身
      ctx.save();
      ctx.translate(cx, cy);
      
      // 采用水平线性渐变，制造圆柱体 3D 弧面阴影错觉
      const grad = ctx.createLinearGradient(-55, 0, 55, 0);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.65)');

      ctx.beginPath();
      if (ctx.roundRect) {
         ctx.roundRect(-55, -65, 110, 145, [20, 20, 30, 30]); // 圆润的肩膀和更圆的底部
      } else {
         ctx.rect(-55, -65, 110, 145);
      }
      ctx.fillStyle = grad;
      ctx.shadowColor = isLeft ? 'rgba(244,63,94,0.25)' : 'rgba(14,165,233,0.25)';
      ctx.shadowBlur = 15;
      ctx.fill();

      // 玻璃边缘外轮廓
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.stroke();

      // 内部边缘，模拟玻璃厚度折射
      ctx.beginPath();
      if (ctx.roundRect) {
         ctx.roundRect(-48, -58, 96, 131, [15, 15, 25, 25]);
      }
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 0;
      ctx.stroke();

      // === 局部强反光条 (增加 3D 圆柱玻璃质感) ===
      // 左侧粗高光
      ctx.beginPath();
      ctx.moveTo(-40, -45);
      ctx.lineTo(-40, 55);
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.stroke();
      
      // 右侧细高光
      ctx.beginPath();
      ctx.moveTo(42, -25);
      ctx.lineTo(42, 45);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();
      
      ctx.restore();

      // 6. 绘制瓶颈前景反光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(cx - 12, cy - 88, 5, 20);

      // 7. 绘制瓶子底座投影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 85, 45, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [visualStars, isLeft]);

  return (
    <canvas 
      ref={canvasRef} 
      width={190} 
      height={260} 
      className={`cursor-pointer hover:scale-105 transition-transform duration-300 mx-auto`} 
    />
  );
};

// --- 星星 SVG 图标 (用于弹窗) ---
const StarIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// --- 主页面 ---
export default function WishBottle() {
  const [darkMode, setDarkMode] = useState(false);
  const [aliceStars, setAliceStars] = useState(initialAliceStars);
  const [bobStars, setBobStars] = useState(initialBobStars);

  // === 逻辑状态：摘取次数 ===
  const [pickChances, setPickChances] = useState(3); 

  const [makeWishModal, setMakeWishModal] = useState(false);
  const [pickWishModal, setPickWishModal] = useState(false);
  
  const [newWish, setNewWish] = useState('');
  const [wishColor, setWishColor] = useState('text-rose-400');
  
  // 被抽取的心愿 (需要记录owner以支持放回)
  const [pickedWish, setPickedWish] = useState(null);

  // === 新增：自定义可爱提示框状态 ===
  const [customAlert, setCustomAlert] = useState({ visible: false, message: '' });

  const showAlert = (message) => {
    setCustomAlert({ visible: true, message });
  };

  const starColors = ['text-rose-400', 'text-pink-400', 'text-amber-400', 'text-sky-400', 'text-indigo-400', 'text-purple-400'];

  // === 许下心愿逻辑 (+1次数) ===
  const handleMakeWish = () => {
    if (!newWish.trim()) return showAlert("心愿不能为空哦！");
    const newStar = { id: Date.now(), color: wishColor, content: newWish };
    
    // 按色系放入不同的瓶子
    if (wishColor.includes('rose') || wishColor.includes('pink') || wishColor.includes('amber')) {
      setAliceStars([...aliceStars, newStar]);
    } else {
      setBobStars([...bobStars, newStar]);
    }
    
    setPickChances(prev => prev + 1); // 许愿一次增加一次抽取机会
    setMakeWishModal(false);
    setNewWish('');
  };

  // === 拿取心愿逻辑 (-1次数，从瓶中移除) ===
  const handlePickWish = () => {
    if (pickChances <= 0) {
      return showAlert("没有摘取次数了，许愿一次可获得一次哦！");
    }

    // 组合所有星星并打上所有人标签
    const allStars = [
      ...aliceStars.map(s => ({ ...s, owner: 'alice' })),
      ...bobStars.map(s => ({ ...s, owner: 'bob' }))
    ];

    if (allStars.length === 0) return showAlert("两个心愿瓶都已经空啦！");

    // 随机抽取
    const randomStar = allStars[Math.floor(Math.random() * allStars.length)];
    
    // 立即从原本的数组中移除它 (视觉上会看到瓶子更新)
    if (randomStar.owner === 'alice') {
      setAliceStars(prev => prev.filter(s => s.id !== randomStar.id));
    } else {
      setBobStars(prev => prev.filter(s => s.id !== randomStar.id));
    }

    setPickedWish(randomStar);
    setPickChances(prev => prev - 1); // 立即扣除次数
    setPickWishModal(true);
  };

  // === 彻底收下心愿 (不再放回) ===
  const handleKeepWish = () => {
    setPickWishModal(false);
    setPickedWish(null);
  };

  // === 悄悄放回心愿 (不返还次数) ===
  const handlePutBackWish = () => {
    if (pickedWish.owner === 'alice') {
      setAliceStars(prev => [...prev, pickedWish]);
    } else {
      setBobStars(prev => [...prev, pickedWish]);
    }
    setPickWishModal(false);
    setPickedWish(null);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="w-full max-w-[400px] mx-auto h-screen relative flex flex-col font-sans overflow-hidden sm:border-x sm:border-slate-200 dark:sm:border-slate-800 sm:shadow-2xl transition-colors duration-500 bg-white dark:bg-slate-950">
        
        {/* ================= 1. 一分为二的动态背景 & 流星雨 ================= */}
        <div className="absolute inset-0 flex z-0">
          <div className="w-1/2 h-full bg-gradient-to-b from-rose-50/80 to-pink-100/80 dark:from-rose-950/40 dark:to-slate-900 transition-colors duration-500 relative overflow-hidden">
             <div className="absolute top-20 left-[-20%] w-64 h-64 bg-rose-300/50 dark:bg-rose-800/30 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
          </div>
          <div className="w-1/2 h-full bg-gradient-to-b from-sky-50/80 to-blue-100/80 dark:from-sky-950/40 dark:to-slate-900 transition-colors duration-500 relative overflow-hidden">
             <div className="absolute bottom-40 right-[-20%] w-64 h-64 bg-sky-300/50 dark:bg-sky-800/30 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>
          </div>
        </div>
        
        {/* 流星背景层 */}
        <MeteorBackground darkMode={darkMode} />

        {/* ================= 2. 中轴分割线 ================= */}
        <div className="absolute left-1/2 top-24 bottom-12 w-px bg-gradient-to-b from-transparent via-white dark:via-slate-600 to-transparent transform -translate-x-1/2 z-0 opacity-70">
           <div className="absolute top-1/3 left-1/2 w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-400 shadow-[0_0_8px_rgba(255,255,255,1)] transform -translate-x-1/2"></div>
           <div className="absolute top-2/3 left-1/2 w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-400 shadow-[0_0_8px_rgba(255,255,255,1)] transform -translate-x-1/2"></div>
        </div>

        {/* ================= 3. 顶部导航栏 ================= */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-center relative z-20">
          <button className="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white shadow-sm border border-white/60 dark:border-slate-700/60 transition-all active:scale-95">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-widest transition-colors duration-500">心愿瓶</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white shadow-sm border border-white/60 dark:border-slate-700/60 transition-all active:scale-95"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </header>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col relative z-10">
          
          {/* ================= 4. 胶囊头像区 & 摘取次数爱心 ================= */}
          <div className="flex w-full px-6 mt-4 animate-fade-in-up relative z-20">
            <div className="w-1/2 flex justify-center pr-4 relative">
              <div className="flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-full p-1.5 shadow-md shadow-rose-200/50 dark:shadow-none border border-white/80 dark:border-slate-600/50 hover:scale-105 transition-transform cursor-pointer">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=fecdd3" alt="Alice" className="w-9 h-9 rounded-full bg-rose-200 border-2 border-white dark:border-slate-700" />
                <span className="px-3 text-[13px] font-extrabold text-rose-500 dark:text-rose-400">Alice</span>
              </div>
            </div>
            <div className="w-1/2 flex justify-center pl-4 relative">
              <div className="flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-full p-1.5 shadow-md shadow-sky-200/50 dark:shadow-none border border-white/80 dark:border-slate-600/50 hover:scale-105 transition-transform cursor-pointer">
                <span className="px-3 text-[13px] font-extrabold text-sky-500 dark:text-sky-400">Bob</span>
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Bob&backgroundColor=bae6fd" alt="Bob" className="w-9 h-9 rounded-full bg-sky-200 border-2 border-white dark:border-slate-700" />
              </div>
            </div>

            {/* === 新增：正中间的爱心次数显示 === */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center hover:scale-110 transition-transform cursor-help group z-30">
                {/* 动态呼吸光晕背景 */}
                <div className="absolute inset-0 bg-rose-400/30 dark:bg-rose-500/30 rounded-full blur-xl scale-[1.8] animate-pulse"></div>
                
                {/* 红色立体爱心 */}
                <div className="w-12 h-12 relative flex items-center justify-center animate-bounce-slow">
                    <svg className="absolute w-full h-full text-rose-500 dark:text-rose-400 drop-shadow-[0_4px_12px_rgba(244,63,94,0.4)]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {/* 中间的剩余次数 */}
                    <span className="absolute text-[15px] font-black text-white mt-[-2px]">{pickChances}</span>
                </div>
                
                {/* 悬浮 Tooltip 提示 */}
                <div className="absolute top-14 w-28 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   <span className="text-[10px] font-bold text-white bg-slate-800/90 dark:bg-black/90 px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl">剩余摘取次数</span>
                </div>
            </div>
          </div>

          <div className="flex-1 flex items-center px-2">
            {/* ================= 5. Canvas 圆柱形许愿瓶区 ================= */}
            <div className="flex w-full mt-4">
              <div className="w-1/2 flex justify-center animate-float-slow">
                 <CanvasCylinderBottle starsData={aliceStars} isLeft={true} />
              </div>
              <div className="w-1/2 flex justify-center animate-float-slower">
                 <CanvasCylinderBottle starsData={bobStars} isLeft={false} />
              </div>
            </div>
          </div>

          {/* ================= 6. 底部双按钮区 ================= */}
          <div className="flex w-full mb-12 px-6 relative z-10 animate-fade-in-up">
            <div className="w-1/2 pr-4 flex justify-center">
              <button 
                onClick={() => setMakeWishModal(true)}
                className="w-full py-4 rounded-[1.5rem] bg-gradient-to-br from-rose-400 to-pink-500 text-white font-extrabold text-[15px] shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex justify-center items-center"
              >
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                许下心愿
              </button>
            </div>
            <div className="w-1/2 pl-4 flex justify-center">
              <button 
                onClick={handlePickWish}
                className="w-full py-4 rounded-[1.5rem] bg-gradient-to-br from-sky-400 to-blue-500 text-white font-extrabold text-[15px] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex justify-center items-center"
              >
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                拿取心愿
              </button>
            </div>
          </div>

        </div>

        {/* ================= 弹窗 1: 许下心愿 ================= */}
        {makeWishModal && (
          <div className="absolute inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMakeWishModal(false)}></div>
            <div className="relative w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/60 dark:border-slate-700/50 shadow-2xl p-8 animate-slide-up flex flex-col">
              
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
              
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-6 text-center">叠一颗星星</h2>
              
              <div className="flex justify-center space-x-4 mb-6">
                {starColors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setWishColor(color)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${wishColor === color ? 'bg-slate-100 dark:bg-slate-800 scale-125 shadow-sm' : 'hover:scale-110 opacity-70'}`}
                  >
                    <StarIcon className={`w-7 h-7 drop-shadow-sm ${color}`} />
                  </button>
                ))}
              </div>

              <textarea 
                value={newWish}
                onChange={e => setNewWish(e.target.value)}
                rows="4"
                placeholder="偷偷写下你的小小心愿..."
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-slate-600 transition-all resize-none shadow-inner"
              ></textarea>

              <button 
                onClick={handleMakeWish}
                className="w-full mt-6 py-4 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-[15px] shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-all"
              >
                放进瓶子
              </button>
            </div>
          </div>
        )}

        {/* ================= 弹窗 2: 拆开星星 (拿取心愿) ================= */}
        {pickWishModal && pickedWish && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setPickWishModal(false)}></div>
            
            <div className="relative w-full max-w-[320px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 dark:border-slate-600/50 shadow-2xl p-8 flex flex-col items-center text-center animate-zoom-in">
              
              <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-30 ${pickedWish.color.replace('text', 'bg')}`}></div>

              <div className={`w-24 h-24 mb-6 relative flex items-center justify-center animate-bounce-slow`}>
                 <StarIcon className={`w-24 h-24 drop-shadow-xl ${pickedWish.color}`} />
              </div>

              <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">拆开了一颗星星</h3>
              
              <div className="w-full bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-inner">
                <p className="text-base font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                  "{pickedWish.content}"
                </p>
              </div>

              {/* 拆开后的双操作按钮区 */}
              <div className="w-full mt-8 flex flex-col space-y-3">
                <button 
                  onClick={handleKeepWish}
                  className={`w-full py-4 rounded-[1.5rem] text-white font-extrabold text-[15px] shadow-xl hover:scale-105 active:scale-95 transition-all bg-gradient-to-r ${
                    pickedWish.color.includes('rose') ? 'from-rose-400 to-pink-500 shadow-rose-500/30' :
                    pickedWish.color.includes('amber') ? 'from-amber-400 to-orange-500 shadow-amber-500/30' :
                    pickedWish.color.includes('sky') ? 'from-sky-400 to-blue-500 shadow-sky-500/30' :
                    pickedWish.color.includes('indigo') ? 'from-indigo-400 to-purple-500 shadow-indigo-500/30' :
                    'from-slate-700 to-slate-900 shadow-slate-900/30'
                  }`}
                >
                  收下心愿
                </button>
                <button 
                  onClick={handlePutBackWish}
                  className="w-full py-3 rounded-[1.5rem] text-slate-500 dark:text-slate-400 font-bold text-sm bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
                >
                  悄悄放回去 <span className="text-[10px] opacity-70 ml-1">(不返还次数)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= 弹窗 3: 自定义可爱提示框 ================= */}
        {customAlert.visible && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCustomAlert({ ...customAlert, visible: false })}></div>
            
            <div className="relative w-full max-w-[280px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-slate-600/50 shadow-2xl p-6 flex flex-col items-center text-center animate-zoom-in">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mb-4 text-rose-500 dark:text-rose-400 animate-bounce-slow">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white mb-2">提示</h3>
              <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {customAlert.message}
              </p>
              <button 
                onClick={() => setCustomAlert({ ...customAlert, visible: false })}
                className="w-full py-3.5 rounded-[1.25rem] bg-gradient-to-r from-rose-400 to-pink-500 text-white font-extrabold text-[14px] shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                我知道啦
              </button>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar { display: none !important; }
          .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

          @keyframes floatSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-float-slow { animation: floatSlow 4s ease-in-out infinite; }

          @keyframes floatSlower {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          .animate-float-slower { animation: floatSlower 5s ease-in-out infinite reverse; }
          
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