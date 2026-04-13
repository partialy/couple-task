import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, History, Plus, Sparkles } from 'lucide-react';
import wishService, { type WishItem } from '@/api/service/wish';
import { useUserStore } from '@/store/user';
import { message } from '@/utils/pure/message';
import MemorialTransparentHeader from '@/components/memorial/MemorialTransparentHeader';
import MeteorBackground from './MeteorBackground';
import CanvasCylinderBottle from './CanvasCylinderBottle';
import WishMyRecordsPanel from './WishMyRecordsPanel';
import {
  STAR_COLOR_KEYS,
  colorKeyToBgBlur,
  colorKeyToClass,
  wishToStarDisplay,
  type StarDisplay,
} from './wishDisplay';

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function displayName(u: { nickname?: string; username: string } | null | undefined) {
  if (!u) return '…';
  return u.nickname?.trim() || u.username;
}

/** 与 App 全局一致：跟随 document.documentElement 的 `dark` 类（不设本页手动切换） */
function useHtmlDarkClass(): boolean {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains('dark'));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

interface WishPageProps {
  onBack: () => void;
}

export default function WishPage({ onBack }: WishPageProps) {
  const htmlDark = useHtmlDarkClass();
  const { currentUser, bindUser, bindingRelations } = useUserStore();
  const bindId = bindingRelations?.id;

  const [myPickChances, setMyPickChances] = useState(0);
  const [partnerPickChances, setPartnerPickChances] = useState(0);
  const [warmStars, setWarmStars] = useState<StarDisplay[]>([]);
  const [coolStars, setCoolStars] = useState<StarDisplay[]>([]);

  const [makeWishModal, setMakeWishModal] = useState(false);
  const [pickWishModal, setPickWishModal] = useState(false);
  const [newWish, setNewWish] = useState('');
  const [wishColorKey, setWishColorKey] = useState<string>('rose400');
  const [pickedWish, setPickedWish] = useState<WishItem | null>(null);
  const [recordsOpen, setRecordsOpen] = useState(false);

  /** 与倒数日详情层一致：pick / make / 我的心愿 共用 history 栈，系统返回先关最上层 */
  const skipWishPopSyncRef = useRef(false);
  const pickedWishIdRef = useRef<string | null>(null);
  pickedWishIdRef.current = pickedWish?.id ?? null;

  /** 延后挂载 Canvas 层，避免与全屏进入动画同一帧抢主线程 */
  const [canvasLayerReady, setCanvasLayerReady] = useState(false);
  useEffect(() => {
    let id = 0;
    id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setCanvasLayerReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const reload = useCallback(async () => {
    if (!bindId) return;
    const [sum, partner] = await Promise.all([
      wishService.summary(bindId),
      wishService.listPartnerPending(bindId),
    ]);
    if (sum.success && sum.data) {
      setMyPickChances(sum.data.myPickChances);
      setPartnerPickChances(sum.data.partnerPickChances);
    }
    if (partner.success && partner.data) {
      const warm = partner.data.filter((w) => w.bottleSide === 1).map(wishToStarDisplay);
      const cool = partner.data.filter((w) => w.bottleSide === 2).map(wishToStarDisplay);
      setWarmStars(warm);
      setCoolStars(cool);
    }
  }, [bindId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const overlayKind: 'pick' | 'make' | 'records' | null = pickWishModal
      ? 'pick'
      : makeWishModal
        ? 'make'
        : recordsOpen
          ? 'records'
          : null;

    if (!overlayKind) return;

    const st = window.history.state as Record<string, unknown> | null;

    if (st?.wishOverlay === 'pick' && overlayKind === 'make') {
      window.history.replaceState(
        { ...st, view: st.view ?? 'wish', wishOverlay: 'make' },
        '',
        window.location.href
      );
    } else if (st?.wishOverlay !== overlayKind) {
      window.history.pushState(
        { ...(st || {}), view: (st?.view as string) || 'wish', wishOverlay: overlayKind },
        '',
        window.location.href
      );
    }

    const handlePopState = () => {
      if (skipWishPopSyncRef.current) {
        skipWishPopSyncRef.current = false;
        return;
      }
      if (pickWishModal) {
        const id = pickedWishIdRef.current;
        if (id != null) {
          void wishService.putBack(id).then(() => void reload());
        }
        setPickWishModal(false);
        setPickedWish(null);
      } else if (makeWishModal) {
        setMakeWishModal(false);
      } else if (recordsOpen) {
        setRecordsOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [makeWishModal, pickWishModal, recordsOpen, reload]);

  const handleMakeWish = async () => {
    if (!bindId) return;
    const t = newWish.trim();
    if (!t) {
      message.warning('心愿不能为空哦！');
      return;
    }
    const res = await wishService.add({ bindId, content: t, colorKey: wishColorKey });
    if (res.success) {
      message.success(typeof res.msg === 'string' ? res.msg : '已许下心愿');
      setNewWish('');
      void reload();
      skipWishPopSyncRef.current = true;
      setMakeWishModal(false);
      window.history.back();
    } else {
      message.error(res.msg || '发布失败');
    }
  };

  const handlePickWish = async () => {
    if (!bindId) return;
    const res = await wishService.pick(bindId);
    if (res.success && res.data) {
      setPickedWish(res.data);
      setPickWishModal(true);
      void reload();
    } else {
      message.error(res.msg || '摘取失败');
    }
  };

  const handleKeepWish = async () => {
    if (!pickedWish) return;
    const res = await wishService.keep(pickedWish.id);
    if (res.success) {
      void reload();
      skipWishPopSyncRef.current = true;
      setPickWishModal(false);
      setPickedWish(null);
      window.history.back();
    } else {
      message.error(res.msg || '操作失败');
    }
  };

  const handlePutBackWish = async () => {
    if (!pickedWish) return;
    const res = await wishService.putBack(pickedWish.id);
    if (res.success) {
      void reload();
      skipWishPopSyncRef.current = true;
      setPickWishModal(false);
      setPickedWish(null);
      window.history.back();
    } else {
      message.error(res.msg || '操作失败');
    }
  };

  const noBinding = !bindId;

  const handleHeaderBack = () => {
    if (pickWishModal || makeWishModal) {
      window.history.back();
      return;
    }
    if (recordsOpen) {
      window.history.back();
      return;
    }
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex h-full flex-col overflow-hidden bg-white dark:bg-slate-950"
    >
      <div className="absolute inset-0 z-0 flex">
        <div className="relative h-full w-1/2 overflow-hidden bg-gradient-to-b from-rose-50/80 to-pink-100/80 transition-colors duration-500 dark:from-rose-950/40 dark:to-slate-900">
          <div className="absolute left-[-20%] top-20 h-64 w-64 animate-[pulse_6s_ease-in-out_infinite] rounded-full bg-rose-300/50 blur-3xl dark:bg-rose-800/30" />
        </div>
        <div className="relative h-full w-1/2 overflow-hidden bg-gradient-to-b from-sky-50/80 to-blue-100/80 transition-colors duration-500 dark:from-sky-950/40 dark:to-slate-900">
          <div className="absolute bottom-40 right-[-20%] h-64 w-64 animate-[pulse_8s_ease-in-out_infinite_reverse] rounded-full bg-sky-300/50 blur-3xl dark:bg-sky-800/30" />
        </div>
      </div>

      {canvasLayerReady && <MeteorBackground darkMode={htmlDark} />}

      <div className="absolute bottom-12 left-1/2 top-24 z-0 w-px -translate-x-1/2 transform bg-gradient-to-b from-transparent via-white to-transparent opacity-70 dark:via-slate-600">
        <div className="absolute left-1/2 top-1/3 h-1.5 w-1.5 -translate-x-1/2 transform rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)] dark:bg-slate-400" />
        <div className="absolute left-1/2 top-2/3 h-1.5 w-1.5 -translate-x-1/2 transform rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)] dark:bg-slate-400" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/*
          MemorialTransparentHeader 内已含 AndroidPadding（透明安全区）+ 无底色顶栏，与倒数日一致
        */}
        <MemorialTransparentHeader
          variant="title"
          title="心愿瓶"
          left={
            <button
              type="button"
              onClick={handleHeaderBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md transition-colors hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-white" />
            </button>
          }
          right={
            noBinding ? (
              <div className="h-10 w-10 shrink-0" aria-hidden />
            ) : (
              <button
                type="button"
                aria-label="查看我的心愿记录"
                onClick={() => setRecordsOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md transition-colors hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800"
              >
                <History className="h-5 w-5 text-slate-800 dark:text-white" />
              </button>
            )
          }
        />

        {noBinding ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-slate-400 dark:text-slate-500">
            请先绑定另一半后再使用心愿瓶
          </div>
        ) : (
          <>
            <div className="relative z-20 mt-4 flex w-full animate-[fadeInUp_0.5s_ease-out_forwards] px-6">
              <div className="relative flex w-1/2 justify-center pr-4">
                <div className="flex items-center rounded-full border border-white/80 bg-white/70 p-1.5 shadow-md shadow-rose-200/50 backdrop-blur-xl dark:border-slate-600/50 dark:bg-slate-800/70 dark:shadow-none">
                  <img
                    src={
                      currentUser?.avatar ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(currentUser?.username || 'me')}`
                    }
                    alt=""
                    className="h-9 w-9 rounded-full border-2 border-white bg-rose-200 dark:border-slate-700"
                  />
                  <span className="px-3 text-[13px] font-extrabold text-rose-500 dark:text-rose-400">
                    {displayName(currentUser)}
                  </span>
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-600/80 dark:text-rose-400/90">
                  可摘 {myPickChances} 次
                </span>
              </div>
              <div className="relative flex w-1/2 justify-center pl-4">
                <div className="flex items-center rounded-full border border-white/80 bg-white/70 p-1.5 shadow-md shadow-sky-200/50 backdrop-blur-xl dark:border-slate-600/50 dark:bg-slate-800/70 dark:shadow-none">
                  <span className="px-3 text-[13px] font-extrabold text-sky-500 dark:text-sky-400">
                    {displayName(bindUser)}
                  </span>
                  <img
                    src={
                      bindUser?.avatar ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(bindUser?.username || 'ta')}`
                    }
                    alt=""
                    className="h-9 w-9 rounded-full border-2 border-white bg-sky-200 dark:border-slate-700"
                  />
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-sky-600/80 dark:text-sky-400/90">
                  可摘 {partnerPickChances} 次
                </span>
              </div>
            </div>

            <div className="flex min-h-[260px] flex-1 items-center px-2 pt-10">
              <div className="mt-4 flex w-full">
                {canvasLayerReady ? (
                  <>
                    <div className="flex w-1/2 justify-center [animation:floatSlow_4s_ease-in-out_infinite]">
                      <CanvasCylinderBottle starsData={warmStars} isLeft />
                    </div>
                    <div className="flex w-1/2 justify-center [animation:floatSlower_5s_ease-in-out_infinite_reverse]">
                      <CanvasCylinderBottle starsData={coolStars} isLeft={false} />
                    </div>
                  </>
                ) : (
                  <div className="h-[260px] w-full" aria-hidden />
                )}
              </div>
            </div>

            <div className="relative z-10 mb-10 flex w-full animate-[fadeInUp_0.5s_ease-out_forwards] px-6">
              <div className="flex w-1/2 justify-center pr-4">
                <button
                  type="button"
                  onClick={() => setMakeWishModal(true)}
                  className="flex w-full items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-rose-400 to-pink-500 py-4 text-[15px] font-extrabold text-white shadow-xl shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="mr-1.5 h-5 w-5" strokeWidth={2.5} />
                  许下心愿
                </button>
              </div>
              <div className="flex w-1/2 justify-center pl-4">
                <button
                  type="button"
                  onClick={handlePickWish}
                  className="flex w-full items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-sky-400 to-blue-500 py-4 text-[15px] font-extrabold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="mr-1.5 h-5 w-5" strokeWidth={2.5} />
                  拿取心愿
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {makeWishModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => window.history.back()} />
          <div className="relative flex w-full flex-col rounded-t-[2.5rem] border border-white/60 bg-white/90 p-8 shadow-2xl backdrop-blur-2xl animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards] dark:border-slate-700/50 dark:bg-slate-900/90 sm:rounded-[2.5rem]">
            <div className="mb-6 hidden h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700 sm:mx-auto sm:block" />
            <h2 className="mb-6 text-center text-xl font-extrabold text-slate-800 dark:text-white">叠一颗星星</h2>
            <div className="mb-6 flex justify-center space-x-4">
              {STAR_COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setWishColorKey(key)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    wishColorKey === key ? 'scale-125 bg-slate-100 shadow-sm dark:bg-slate-800' : 'opacity-70 hover:scale-110'
                  }`}
                >
                  <StarIcon className={`h-7 w-7 drop-shadow-sm ${colorKeyToClass(key)}`} />
                </button>
              ))}
            </div>
            <textarea
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              rows={4}
              placeholder="偷偷写下你的小小心愿..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-800 shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:ring-slate-600"
            />
            <button
              type="button"
              onClick={() => void handleMakeWish()}
              className="mt-6 w-full rounded-[1.5rem] bg-slate-900 py-4 text-[15px] font-extrabold text-white shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900 dark:shadow-white/10"
            >
              放进瓶子
            </button>
          </div>
        </div>
      )}

      {pickWishModal && pickedWish && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => window.history.back()} />
          <div className="relative flex w-full max-w-[320px] flex-col items-center rounded-[2.5rem] border border-white/60 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-2xl animate-[zoomIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] dark:border-slate-600/50 dark:bg-slate-800/90">
            <div
              className={`absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl opacity-30 ${colorKeyToBgBlur(pickedWish.colorKey)}`}
            />
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center [animation:bounceSlow_2s_infinite]">
              <StarIcon className={`h-24 w-24 drop-shadow-xl ${colorKeyToClass(pickedWish.colorKey)}`} />
            </div>
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              拆开了一颗星星
            </h3>
            <div className="w-full rounded-2xl border border-slate-100 bg-slate-50/80 p-6 shadow-inner dark:border-slate-700/50 dark:bg-slate-900/50">
              <p className="text-base font-bold leading-relaxed text-slate-700 dark:text-slate-200">
                「{pickedWish.content}」
              </p>
            </div>
            <div className="mt-8 flex w-full flex-col space-y-3">
              <button
                type="button"
                onClick={() => void handleKeepWish()}
                className="w-full rounded-[1.5rem] bg-gradient-to-r from-rose-400 to-pink-500 py-4 text-[15px] font-extrabold text-white shadow-xl shadow-rose-500/30 transition-all hover:scale-105 active:scale-95"
              >
                收下心愿
              </button>
              <button
                type="button"
                onClick={() => void handlePutBackWish()}
                className="w-full rounded-[1.5rem] bg-slate-100/80 py-3 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                悄悄放回去 <span className="ml-1 text-[10px] opacity-70">(不返还次数)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {recordsOpen && (
          <WishMyRecordsPanel key="wish-my-records" onClose={() => window.history.back()} />
        )}
      </AnimatePresence>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes floatSlower {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes bounceSlow {
            0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
            50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
          }
        `,
        }}
      />
    </motion.div>
  );
}
