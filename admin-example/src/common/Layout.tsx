import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  LogOut, 
  Menu,
  Activity,
  CreditCard,
  DollarSign,
  TrendingUp,
  CheckSquare,
  Gift,
  ShoppingBag,
  Ticket,
  FileText,
  MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "控制台", path: "/" },
    { icon: Users, label: "用户管理", path: "/users" },
    { icon: CheckSquare, label: "任务中心", path: "/tasks" },
    { icon: Gift, label: "签到与成就", path: "/checkin" },
    { icon: ShoppingBag, label: "商城与道具", path: "/shop" },
    { icon: Ticket, label: "兑换码中心", path: "/reward-codes" },
    { icon: CreditCard, label: "交易流水", path: "/transactions" },
    { icon: FileText, label: "内容治理", path: "/content" },
    { icon: Bell, label: "通知中心", path: "/notifications" },
    { icon: MessageSquare, label: "反馈工单", path: "/feedbacks" },
    { icon: Settings, label: "系统配置", path: "/settings" },
  ];

  return (
    <div className="h-screen bg-theme-gradient relative overflow-hidden flex">
      {/* Background blobs for dashboard */}
      <div className="blob w-[500px] h-[500px] top-[-200px] right-[-100px] opacity-50 pointer-events-none" />
      <div className="blob w-[600px] h-[600px] bottom-[-200px] left-[-200px] opacity-50 pointer-events-none" />

      {/* 侧边栏 */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="glass-panel border-r-0 flex flex-col hidden md:flex z-20 m-4 rounded-[24px] overflow-hidden shrink-0"
      >
        <div className="h-16 flex items-center justify-center border-b border-[var(--glass-border)] px-4 shrink-0">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img src="/icon_512.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-3 font-semibold text-[var(--text-main)] whitespace-nowrap"
            >
              管理控制台
            </motion.span>
          )}
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? "btn-primary shadow-md text-white" 
                    : "text-[var(--text-muted)] hover:bg-white/50 hover:text-[var(--text-main)]"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"}`} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3 text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-[var(--glass-border)] shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-[var(--text-muted)] hover:bg-red-50/50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 shrink-0 text-neutral-400 group-hover:text-red-500" />
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 text-sm font-medium whitespace-nowrap"
              >
                退出登录
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0 z-10 overflow-hidden h-full">
        {/* 顶部导航 */}
        <header className="h-16 glass-panel rounded-[24px] mx-4 mt-4 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex mr-4 text-neutral-500 hover:text-neutral-900"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative w-64 hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <Input 
                placeholder="搜索..." 
                className="pl-9 input-glass h-9 rounded-full text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-neutral-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative h-8 w-8 rounded-full")}>
                <Avatar className="h-8 w-8 border border-neutral-200">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">管理员</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>个人资料</DropdownMenuItem>
                <DropdownMenuItem>账单设置</DropdownMenuItem>
                <DropdownMenuItem>团队管理</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
