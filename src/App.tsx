import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Moon, Sun, CheckCircle } from 'lucide-react';

// Standard imports instead of lazy load
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Home from './components/home';
import BindingPage from './components/BindingPage';

const PublishTask = lazy(() => import('./components/PublishTask'));
const Shop = lazy(() => import('./components/Shop'));
const SpecialRewards = lazy(() => import('./components/SpecialRewards'));
const Settings = lazy(() => import('./components/Settings'));
const PointsDetail = lazy(() => import('./components/PointsDetail'));
const Achievements = lazy(() => import('./components/achievements/Achievements'));
const ItemsDashboard = lazy(() => import('./components/items/ItemsDashboard'));
const TaskTemplatesPage = lazy(() => import('./components/task-templates/TaskTemplatesPage'));
const PartnerProfilePage = lazy(() => import('./components/partner/PartnerProfilePage'));

import { useUserStore, useTaskStore } from './store';
import eventBus from './utils/eventBus';
import shopItemsService from './api/service/shopItems';
import { mapRecordToShopItem } from './components/shop/mapShopItem';
import type { ShopItem as ShopItemFE } from './components/shop/types';
import specialItemsService from './api/service/specialItems';
import { message } from '@/utils/pure/message';
import { SpecialItem, mapSpecialItemFromApi } from './components/special/types';
import { getInitialDarkMode, writeStoredDarkMode } from './utils/darkMode';


export default function App() {
  const [view, setView] = useState<'login' | 'register' | 'home' | 'publish' | 'shop' | 'settings' | 'points-detail' | 'special-rewards' | 'achievements' | 'items-dashboard' | 'task-templates' | 'partner-profile'>('home');
  const [activeTab, setActiveTab] = useState('square'); // 'square' | 'inprogress' | 'messages' | 'profile'
  const [templateData, setTemplateData] = useState<any>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(() => getInitialDarkMode());
  
  // Use Stores
  const { currentUser, bindingRelations, isLoggedIn, logout, fetchUserDetail } = useUserStore();
  const { tasks: storeTasks, setTasks: setStoreTasks, fetchPublishConfig } = useTaskStore();

  // Local state for non-persisted data or transition
  const [shopItemsRedeem, setShopItemsRedeem] = useState<ShopItemFE[]>([]);
  const [shopItemsPublish, setShopItemsPublish] = useState<ShopItemFE[]>([]);
  const [specialItemsSelf, setSpecialItemsSelf] = useState<SpecialItem[]>([]);
  const [specialItemsTarget, setSpecialItemsTarget] = useState<SpecialItem[]>([]);

  const loadShopItems = useCallback(async () => {
    const [redeemRes, publishRes] = await Promise.all([
      shopItemsService.listForRedeem(),
      shopItemsService.listForPublish(),
    ]);
    if (redeemRes.success && redeemRes.data) {
      setShopItemsRedeem(redeemRes.data.map(mapRecordToShopItem));
    } else {
      setShopItemsRedeem([]);
    }
    if (publishRes.success && publishRes.data) {
      setShopItemsPublish(publishRes.data.map(mapRecordToShopItem));
    } else {
      setShopItemsPublish([]);
    }
  }, []);

  const loadSpecialItems = useCallback(async (type: 'self' | 'target') => {
    const res = await specialItemsService.page({ page: 1, size: 100, type });
    const mapped =
      res.success && res.data?.records ? res.data.records.map(mapSpecialItemFromApi) : [];
    if (type === 'self') {
      setSpecialItemsSelf(mapped);
    } else {
      setSpecialItemsTarget(mapped);
    }
  }, []);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [showBindingPage, setShowBindingPage] = useState(false);

  // Handle toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Handle browser back button
  useEffect(() => {
    // Initialize history state if not present
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '', '#home');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        // Default to home if state is missing
        setView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check binding status after login
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      // If there's no binding relation, show the binding page
      if (!bindingRelations) {
        setShowBindingPage(true);
      } else {
        setShowBindingPage(false);
      }
    } else {
      setShowBindingPage(false);
    }
  }, [isLoggedIn, currentUser, bindingRelations]);

  // Initial data fetch
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserDetail();
      useTaskStore.getState().fetchTasks();
      
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && view === 'shop') {
      void loadShopItems();
    }
  }, [isLoggedIn, view, loadShopItems]);

  // 首次进入首页后，拉取发布配置并写入 store（分类、任务等级）
  useEffect(() => {
    if (isLoggedIn && bindingRelations?.id) {
      fetchPublishConfig(bindingRelations.id);
    }
  }, [isLoggedIn, bindingRelations?.id, fetchPublishConfig]);

  useEffect(() => {
    if (view === 'special-rewards' && isLoggedIn) {
      void Promise.all([loadSpecialItems('self'), loadSpecialItems('target')]);
    }
  }, [view, isLoggedIn, loadSpecialItems]);

  // Custom navigate function that updates history
  const navigateTo = (newView: 'login' | 'register' | 'home' | 'publish' | 'shop' | 'settings' | 'points-detail' | 'special-rewards' | 'achievements' | 'items-dashboard' | 'task-templates' | 'partner-profile') => {
    if (newView !== view) {
      window.history.pushState({ view: newView }, '', `#${newView}`);
      setView(newView);
    }
  };

  // Robust back handler
  const handleBack = () => {
    window.history.back();
    // Fallback in case popstate doesn't fire (e.g., no history)
    setTimeout(() => {
      setView(prev => {
        if (prev !== 'home' && prev !== 'login' && prev !== 'register') {
          window.history.replaceState({ view: 'home' }, '', '#home');
          return 'home';
        }
        return prev;
      });
    }, 50);
  };

  // Toggle dark mode class、持久化 localStorage、同步 URL（便于分享链接）
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    writeStoredDarkMode(isDarkMode);

    const url = new URL(window.location.href);
    url.searchParams.set('darkMode', isDarkMode.toString());
    window.history.replaceState(window.history.state, '', url.toString());
  }, [isDarkMode]);

  // Handlers that integrate with Store
  const handleLogin = () => {
    navigateTo('home');
  };

  const handleLogout = () => {
    logout();
    navigateTo('login');
  };

  const handleLogoutRef = useRef(handleLogout);
  handleLogoutRef.current = handleLogout;

  useEffect(() => {
    const onUnauthorized = (msg: string) => {
      message.error(msg);
      handleLogoutRef.current();
    };
    const onLogout = () => {
      logout();
      navigateTo('login');
    };
    eventBus.on('UNAUTHORIZED', onUnauthorized);
    eventBus.on('LOGOUT', onLogout);
    return () => eventBus.off('UNAUTHORIZED', onUnauthorized);
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden font-sans transition-colors duration-500 bg-white dark:bg-slate-900">
      
      {/* Decorative background elements */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-pink-200 dark:bg-pink-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob transition-colors duration-500"></div>
      <div className="absolute top-[20%] right-[-10%] w-80 h-80 bg-cyan-200 dark:bg-cyan-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-2000 transition-colors duration-500"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-200 dark:bg-purple-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-4000 transition-colors duration-500"></div> */}

      {/* Theme Toggle Button */}
      {(view === 'login' || view === 'register') && (
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-sm border border-white/20 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      )}

      {/* Main App Container */}
      <div className="w-full h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl overflow-hidden relative flex flex-col transition-colors duration-500">
        
        <div className="flex-1 relative">
          {/* Auth Layer */}
          <AnimatePresence>
            {view === 'login' && (
              <LoginForm 
                key="login" 
                onSwitch={() => navigateTo('register')} 
                onBack={handleBack} 
                onLogin={handleLogin} 
              />
            )}
            {view === 'register' && (
              <RegisterForm key="register" onSwitch={() => navigateTo('login')} onBack={handleBack} />
            )}
          </AnimatePresence>

          {/* Main App Layer - Keep Home mounted when sub-pages are open to prevent blank gaps */}
          <AnimatePresence>
            {(view === 'home' || view === 'publish' || view === 'shop' || view === 'settings' || view === 'points-detail' || view === 'special-rewards' || view === 'achievements' || view === 'items-dashboard' || view === 'task-templates' || view === 'partner-profile') && (
              <Home 
                key="home" 
                tasks={storeTasks} 
                setTasks={setStoreTasks} 
                onPublish={() => {
                  setTemplateData(null);
                  navigateTo('publish');
                }}
                onEditTask={(initialData) => {
                  setTemplateData(initialData);
                  navigateTo('publish');
                }}
                onOpenShop={() => navigateTo('shop')} 
                onOpenItems={() => navigateTo('items-dashboard')}
                onOpenSpecialRewards={() => navigateTo('special-rewards')}
                onOpenAchievements={() => navigateTo('achievements')}
                onOpenSettings={() => navigateTo('settings')}
                onOpenPointsDetail={() => navigateTo('points-detail')}
                onOpenTemplates={() => navigateTo('task-templates')}
                onOpenPartnerProfile={() => navigateTo('partner-profile')}
                onLogout={handleLogout}
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isLoggedIn={isLoggedIn}
                currentUser={currentUser || null}
                onLoginPrompt={() => navigateTo('login')}
                onOpenBindingPage={() => setShowBindingPage(true)}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode((v) => !v)}
              />
            )}
          </AnimatePresence>

          {/* Overlays Layer - Pages that slide over Home */}
          <Suspense
            fallback={
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-pink-500 dark:border-slate-600 dark:border-t-pink-400" />
              </div>
            }
          >
          <AnimatePresence>
            {view === 'publish' && (
              <PublishTask 
                onBack={handleBack} 
                onPublish={() => {
                  setTemplateData(null);
                  handleBack();
                }} 
                initialData={templateData}
              />
            )}
            {view === 'task-templates' && (
              <TaskTemplatesPage 
                onBack={handleBack}
                onUseTemplate={(template) => {
                  setTemplateData(template);
                  navigateTo('publish');
                }}
              />
            )}
            {view === 'shop' && (
              <Shop 
                onBack={handleBack} 
                onOpenPointsDetail={() => navigateTo('points-detail')}
                redeemItems={shopItemsRedeem}
                publishItems={shopItemsPublish}
                onRefreshShop={loadShopItems}
              />
            )}
            {view === 'special-rewards' && (
              <SpecialRewards 
                onBack={handleBack} 
                specialItemsSelf={specialItemsSelf}
                specialItemsTarget={specialItemsTarget}
                onRefreshSelf={() => loadSpecialItems('self')}
                onRefreshTarget={() => loadSpecialItems('target')}
              />
            )}
            {view === 'settings' && (
              <Settings 
                onBack={handleBack} 
                onLogout={() => navigateTo('login')}
              />
            )}
            {view === 'points-detail' && (
              <PointsDetail 
                onBack={handleBack} 
              />
            )}
            {view === 'achievements' && (
              <Achievements 
                onBack={handleBack} 
              />
            )}
            {view === 'items-dashboard' && (
              <ItemsDashboard 
                onBack={handleBack} 
              />
            )}
            {view === 'partner-profile' && (
              <PartnerProfilePage onBack={handleBack} />
            )}
            {showBindingPage && (
              <BindingPage 
                onClose={() => setShowBindingPage(false)}
                navigateTo={navigateTo}
                currentUser={currentUser}
              />
            )}
          </AnimatePresence>
          </Suspense>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed top-12 left-1/2 -translate-x-1/2 z-100 px-5 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-800 dark:text-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center space-x-3 border border-white/40 dark:border-slate-700/50"
            >
              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
