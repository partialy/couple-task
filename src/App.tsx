import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun, CheckCircle } from "lucide-react";

// Standard imports instead of lazy load
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Home from "./components/home";
import BindingPage from "./components/BindingPage";

const PublishTask = lazy(() => import("./components/PublishTask"));
const Shop = lazy(() => import("./components/Shop"));
const SpecialRewards = lazy(() => import("./components/SpecialRewards"));
const Settings = lazy(() => import("./components/Settings"));
const PointsDetail = lazy(() => import("./components/PointsDetail"));
const Achievements = lazy(
  () => import("./components/achievements/Achievements"),
);
const ItemsDashboard = lazy(() => import("./components/items/ItemsDashboard"));
const TaskTemplatesPage = lazy(
  () => import("./components/task-templates/TaskTemplatesPage"),
);
const PartnerProfilePage = lazy(
  () => import("./components/partner/PartnerProfilePage"),
);
const Checkin = lazy(() => import("./components/Checkin"));
const CheckinManage = lazy(() => import("./components/CheckinManage"));
const SchedulePage = lazy(() => import("./components/schedule/SchedulePage"));
const MemorialPage = lazy(() => import("./components/memorial/MemorialPage"));
const WishPage = lazy(() => import("./components/wish/WishPage"));
const MomentsPage = lazy(() => import("./components/moments/MomentsPage"));

import { useUserStore, useTaskStore, useMessageStore } from "./store";
import { fetchChatConversationRows } from "@/utils/chatConversationList";
import eventBus from "./utils/eventBus";
import shopItemsService from "./api/service/shopItems";
import { mapRecordToShopItem } from "./components/shop/mapShopItem";
import type { ShopItem as ShopItemFE } from "./components/shop/types";
import specialItemsService from "./api/service/specialItems";
import { message } from "@/utils/pure/message";
import { SpecialItem, mapSpecialItemFromApi } from "./components/special/types";
import { getInitialDarkMode, writeStoredDarkMode } from "./utils/darkMode";
import {
  connectChatWebSocket,
  disconnectChatWebSocket,
  setChatHomeActiveTab,
} from "@/ws/chatWebSocketClient";
import {
  connectSystemNoticeWebSocket,
  disconnectSystemNoticeWebSocket,
  hydrateSystemNoticeState,
} from "@/ws/systemNoticeWebSocketClient";
import AndroidPadding from "./components/ui/AndroidPadding";
import scheduleService, { ScheduleItem } from "./api/service/schedule";
import ScheduleReminderModal from "./components/schedule/ScheduleReminderModal";
import {
  getNoRemindScheduleIds,
  markScheduleNoRemind,
} from "./components/schedule/reminderStorage";

export default function App() {
  const [view, setView] = useState<
    | "login"
    | "register"
    | "home"
    | "publish"
    | "shop"
    | "settings"
    | "points-detail"
    | "special-rewards"
    | "achievements"
    | "items-dashboard"
    | "task-templates"
    | "partner-profile"
    | "checkin"
    | "checkin-manage"
    | "schedule"
    | "memorial"
    | "wish"
    | "moments"
  >("home");
  const [activeTab, setActiveTab] = useState("square"); // 'square' | 'inprogress' | 'messages' | 'profile'
  const [templateData, setTemplateData] = useState<any>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => getInitialDarkMode());

  // Use Stores
  const {
    currentUser,
    bindUser,
    bindingRelations,
    isLoggedIn,
    logout,
    fetchUserDetail,
  } = useUserStore();
  const {
    tasks: storeTasks,
    setTasks: setStoreTasks,
    fetchPublishConfig,
  } = useTaskStore();

  const [shopItemsRedeem, setShopItemsRedeem] = useState<ShopItemFE[]>([]);
  const [shopItemsPublish, setShopItemsPublish] = useState<ShopItemFE[]>([]);
  const [specialItemsSelf, setSpecialItemsSelf] = useState<SpecialItem[]>([]);
  const [specialItemsTarget, setSpecialItemsTarget] = useState<SpecialItem[]>(
    [],
  );

  const [lastLoadTaskTime, setLastLoadTaskTime] = useState<number>(0);

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

  const loadSpecialItems = useCallback(async (type: "self" | "target") => {
    const res = await specialItemsService.page({ page: 1, size: 100, type });
    const mapped =
      res.success && res.data?.records
        ? res.data.records.map(mapSpecialItemFromApi)
        : [];
    if (type === "self") {
      setSpecialItemsSelf(mapped);
    } else {
      setSpecialItemsTarget(mapped);
    }
  }, []);

  const [showBindingPage, setShowBindingPage] = useState(false);
  const [scheduleReminders, setScheduleReminders] = useState<ScheduleItem[]>([]);
  const [showScheduleReminderModal, setShowScheduleReminderModal] = useState(false);
  const scheduleReminderLoadedRef = useRef<string>("");

  // Handle browser back button
  useEffect(() => {
    // Initialize history state if not present
    if (!window.history.state) {
      window.history.replaceState({ view: "home" }, "", "#home");
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        // Default to home if state is missing
        setView("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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

  // Home 底栏 tab 同步给 WS 单例（新消息横幅是否打扰）
  useEffect(() => {
    setChatHomeActiveTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const openMessages = () => setActiveTab("messages");
    eventBus.on("OPEN_MESSAGES_TAB", openMessages);
    return () => {
      eventBus.off("OPEN_MESSAGES_TAB", openMessages);
    };
  }, []);

  // 每次进入首页拉取任务信息
  useEffect(() => {
    if (view !== "home" || activeTab !== "square" || !isLoggedIn) {
      return;
    }
    if (Date.now() - lastLoadTaskTime < 1000 * 5) {
      return;
    }
    useTaskStore.getState().fetchTasks();
    setLastLoadTaskTime(Date.now());
  }, [view, activeTab, isLoggedIn, lastLoadTaskTime]);

  // 预拉会话列表，供底栏未读角标与 WS 增量在未打开「消息」页时仍可用
  useEffect(() => {
    if (!isLoggedIn || !currentUser || !bindUser) {
      if (!isLoggedIn) {
        useMessageStore.getState().setConversations([]);
      }
      return;
    }
    void (async () => {
      const rows = await fetchChatConversationRows(bindUser, currentUser);
      useMessageStore.getState().setConversations(rows);
    })();
  }, [isLoggedIn, currentUser?.id, bindUser?.id]);

  useEffect(() => {
    if (isLoggedIn && view === "shop") {
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
    if (view === "special-rewards" && isLoggedIn) {
      void Promise.all([loadSpecialItems("self"), loadSpecialItems("target")]);
    }
  }, [view, isLoggedIn, loadSpecialItems]);

  useEffect(() => {
    if (!isLoggedIn || !bindingRelations?.id) {
      scheduleReminderLoadedRef.current = "";
      setScheduleReminders([]);
      setShowScheduleReminderModal(false);
      return;
    }

    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const requestKey = `${bindingRelations.id}_${dateKey}`;
    if (scheduleReminderLoadedRef.current === requestKey) {
      return;
    }
    scheduleReminderLoadedRef.current = requestKey;

    void (async () => {
      try {
        const res = await scheduleService.todayReminders(bindingRelations.id, dateKey);
        if (!res.success || !res.data) {
          return;
        }
        const noRemindIds = getNoRemindScheduleIds();
        const pending = res.data.filter((item) => !noRemindIds.has(item.id));
        if (pending.length > 0) {
          setScheduleReminders(pending);
          setShowScheduleReminderModal(true);
        }
      } catch (error) {
        console.error("加载日程提醒失败", error);
      }
    })();
  }, [isLoggedIn, bindingRelations?.id]);

  const handleNoRemindSchedules = useCallback(() => {
    markScheduleNoRemind(scheduleReminders.map((item) => item.id));
    setShowScheduleReminderModal(false);
    setScheduleReminders([]);
  }, [scheduleReminders]);

  const navigateTo = useCallback(
    (
      newView:
        | "login"
        | "register"
        | "home"
        | "publish"
        | "shop"
        | "settings"
        | "points-detail"
        | "special-rewards"
        | "achievements"
        | "items-dashboard"
        | "task-templates"
        | "partner-profile"
        | "checkin"
        | "checkin-manage"
        | "schedule"
        | "memorial"
        | "wish"
        | "moments",
    ) => {
      setView((prev) => {
        if (newView !== prev) {
          window.history.pushState({ view: newView }, "", `#${newView}`);
          return newView;
        }
        return prev;
      });
    },
    [],
  );

  const handleBack = useCallback(() => {
    window.history.back();
    setTimeout(() => {
      setView((prev) => {
        if (prev !== "home" && prev !== "login" && prev !== "register") {
          window.history.replaceState({ view: "home" }, "", "#home");
          return "home";
        }
        return prev;
      });
    }, 50);
  }, []);

  // Toggle dark mode class、持久化 localStorage、同步 URL（便于分享链接）
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    writeStoredDarkMode(isDarkMode);

    const url = new URL(window.location.href);
    url.searchParams.set("darkMode", isDarkMode.toString());
    window.history.replaceState(window.history.state, "", url.toString());
  }, [isDarkMode]);

  const handleLogin = useCallback(() => {
    navigateTo("home");
  }, [navigateTo]);

  useEffect(() => {
    const onLogout = () => {
      logout();
      setView("login");
      window.history.replaceState({ view: "login" }, "", "#login");
    };
    const onUnauthorized = (msg: string) => {
      message.error(msg);
      onLogout();
    };

    if (!currentUser) {
      void (async () => await fetchUserDetail())();
    }

    eventBus.on("UNAUTHORIZED", onUnauthorized);
    eventBus.on("LOGOUT", onLogout);
    return () => {
      eventBus.off("UNAUTHORIZED", onUnauthorized);
      eventBus.off("LOGOUT", onLogout);
    };
  }, [logout, fetchUserDetail, currentUser]);

  // 已登录：主界面常驻聊天 WebSocket（不依赖是否打开「消息」tab）
  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      connectChatWebSocket();
      connectSystemNoticeWebSocket();
      void hydrateSystemNoticeState();
      return () => {
        disconnectChatWebSocket();
        disconnectSystemNoticeWebSocket();
      };
    }
    disconnectChatWebSocket();
    disconnectSystemNoticeWebSocket();
    return () => {};
  }, [isLoggedIn, currentUser?.id]);

  return (
    <div className="h-screen w-screen relative overflow-hidden font-sans transition-colors duration-500 bg-white dark:bg-slate-900">
      {/* Decorative background elements */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-pink-200 dark:bg-pink-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob transition-colors duration-500"></div>
      <div className="absolute top-[20%] right-[-10%] w-80 h-80 bg-cyan-200 dark:bg-cyan-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-2000 transition-colors duration-500"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-200 dark:bg-purple-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-4000 transition-colors duration-500"></div> */}

      {/* Main App Container */}
      <div className="w-full h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl overflow-hidden relative flex flex-col transition-colors duration-500">
        <div className="flex-1 relative">
          {/* Auth Layer */}
          <AnimatePresence>
            {view === "login" && (
              <>
                <AndroidPadding />
                <LoginForm
                  key="login"
                  onSwitch={() => navigateTo("register")}
                  onBack={handleBack}
                  onLogin={handleLogin}
                />
              </>
            )}
            {view === "register" && (
              <RegisterForm
                key="register"
                onSwitch={() => navigateTo("login")}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>

          {/* Main App Layer - Keep Home mounted when sub-pages are open to prevent blank gaps */}
          <AnimatePresence>
            {(view === "home" ||
              view === "publish" ||
              view === "shop" ||
              view === "settings" ||
              view === "points-detail" ||
              view === "special-rewards" ||
              view === "achievements" ||
              view === "items-dashboard" ||
              view === "task-templates" ||
              view === "partner-profile" ||
              view === "checkin" ||
              view === "checkin-manage" ||
              view === "schedule" ||
              view === "memorial" ||
              view === "wish" ||
              view === "moments") && (
              <Home
                key="home"
                tasks={storeTasks}
                setTasks={setStoreTasks}
                onPublish={() => {
                  setTemplateData(null);
                  navigateTo("publish");
                }}
                onEditTask={(initialData) => {
                  setTemplateData(initialData);
                  navigateTo("publish");
                }}
                onOpenShop={() => navigateTo("shop")}
                onOpenCheckin={() => navigateTo("checkin")}
                onOpenCheckinManage={() => navigateTo("checkin-manage")}
                onOpenItems={() => navigateTo("items-dashboard")}
                onOpenSpecialRewards={() => navigateTo("special-rewards")}
                onOpenAchievements={() => navigateTo("achievements")}
                onOpenSettings={() => navigateTo("settings")}
                onOpenPointsDetail={() => navigateTo("points-detail")}
                onOpenTemplates={() => navigateTo("task-templates")}
                onOpenPartnerProfile={() => navigateTo("partner-profile")}
                onOpenSchedule={() => navigateTo("schedule")}
                onOpenMemorial={() => navigateTo("memorial")}
                onOpenWish={() => navigateTo("wish")}
                onOpenMoments={() => navigateTo("moments")}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoggedIn={isLoggedIn}
                currentUser={currentUser || null}
                onLoginPrompt={() => navigateTo("login")}
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
              {view === "publish" && (
                <PublishTask
                  onBack={handleBack}
                  onPublish={() => {
                    setTemplateData(null);
                    handleBack();
                  }}
                  initialData={templateData}
                />
              )}
              {view === "task-templates" && (
                <TaskTemplatesPage
                  onBack={handleBack}
                  onUseTemplate={(template) => {
                    setTemplateData(template);
                    navigateTo("publish");
                  }}
                />
              )}
              {view === "shop" && (
                <Shop
                  onBack={handleBack}
                  onOpenPointsDetail={() => navigateTo("points-detail")}
                  redeemItems={shopItemsRedeem}
                  publishItems={shopItemsPublish}
                  onRefreshShop={loadShopItems}
                />
              )}
              {view === "special-rewards" && (
                <SpecialRewards
                  onBack={handleBack}
                  specialItemsSelf={specialItemsSelf}
                  specialItemsTarget={specialItemsTarget}
                  onRefreshSelf={() => loadSpecialItems("self")}
                  onRefreshTarget={() => loadSpecialItems("target")}
                />
              )}
              {view === "settings" && <Settings onBack={handleBack} />}
              {view === "points-detail" && <PointsDetail onBack={handleBack} />}
              {view === "achievements" && <Achievements onBack={handleBack} />}
              {view === "items-dashboard" && (
                <ItemsDashboard onBack={handleBack} />
              )}
              {view === "partner-profile" && (
                <PartnerProfilePage onBack={handleBack} />
              )}
              {view === "checkin" && <Checkin onBack={handleBack} />}
              {view === "checkin-manage" && (
                <CheckinManage onBack={handleBack} />
              )}
              {view === "schedule" && <SchedulePage onBack={handleBack} />}
              {view === "memorial" && <MemorialPage onBack={handleBack} />}
              {view === "wish" && <WishPage onBack={handleBack} />}
              {view === "moments" && <MomentsPage onBack={handleBack} />}
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
      </div>
      <ScheduleReminderModal
        isOpen={showScheduleReminderModal}
        reminders={scheduleReminders}
        onClose={() => setShowScheduleReminderModal(false)}
        onNoRemind={handleNoRemindSchedules}
      />
    </div>
  );
}
