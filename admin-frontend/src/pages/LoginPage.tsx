import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/api/adminApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("请输入用户名和密码");
      return;
    }
    setIsLoading(true);
    try {
      const data = await adminApi.login({ username, password });
      localStorage.setItem("admin-token", data.token);
      toast.success("登录成功，欢迎回来！");
      navigate("/");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "登录失败";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-gradient relative overflow-hidden">
      <motion.div
        className="blob w-[400px] h-[400px] top-[-100px] left-[-100px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob w-[400px] h-[400px] bottom-[-100px] right-[-100px]"
        animate={{ x: [0, -40, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10 px-4"
      >
        <Card className="glass-panel border-0 rounded-[32px] p-2 sm:p-4">
          <CardHeader className="space-y-2 text-center pb-8 pt-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto flex items-center justify-center mb-4"
            >
              <img src="/icon_512.png" alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight text-[var(--text-main)]">极简管理后台</CardTitle>
            <CardDescription className="text-[var(--text-muted)] text-sm">欢迎回来，请登录您的账号</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[var(--text-muted)]">
                  用户名
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="username"
                    placeholder="admin"
                    className="pl-10 input-glass h-[50px]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[var(--text-muted)]">
                    密码
                  </Label>
                  <span className="text-xs text-[var(--primary)] font-medium">安全登录</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 input-glass h-[50px]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full btn-primary h-[50px] text-base font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在验证...</span>
                  </motion.div>
                ) : (
                  <span>登录</span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} 管理后台 · 保留所有权利</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
