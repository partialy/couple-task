import { create } from 'zustand';
import { authService } from '@/api/service/auth';
import { userService } from '@/api/service/user';
import { BindingRelations, Users } from '@/api/sql_models';
import { message } from '@/utils/pure/message';
import { ApiResponse, UserLoginResponse } from '@/api/types';

interface UserState {
  currentUser: Users | null;
  bindingRelations: BindingRelations | null;
  isLoggedIn: boolean;
  login: (username: string, password: string, code?: string) => Promise<boolean>;
  loginAfterRegister: (res : ApiResponse<UserLoginResponse>) => void;
  logout: () => void;
  updatePoints: (amount: number) => void;
  updateProfile: (updates: Partial<Users>) => Promise<boolean>;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  fetchUserDetail: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    (set, get) => ({
      currentUser: null,
      bindingRelations: null,
      isLoggedIn: true,
      setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),

      login: async (username: string, password: string, code?: string) => {
        const res = await authService.login(username, password, code);
        if (res.success) {
          set({ 
            currentUser: res.data.user, 
            bindingRelations: res.data.bindingRelations,
            isLoggedIn: true 
          });
          localStorage.setItem('token', res.data.token);
          return true;
        } else {
          message.error(res.msg);
          return false;
        }
      },
      loginAfterRegister: (res : ApiResponse<UserLoginResponse>) => {
        if (res.success) {
          set({ 
            currentUser: res.data.user, 
            bindingRelations: res.data.bindingRelations,
            isLoggedIn: true 
          });
          localStorage.setItem('token', res.data.token);
        }
      },

      logout: async () => {
        // await authService.logout();
        set({ currentUser: null, bindingRelations: null, isLoggedIn: false });
        localStorage.removeItem('token');
      },

      updatePoints: async (amount) => {
        const { currentUser } = get();
        if (currentUser) {
          const newPoints = currentUser.points + amount;
          const updatedUser = { ...currentUser, points: newPoints };

          set({
            currentUser: updatedUser,
          });
        }
      },

      updateProfile: async (updates) => {
        const res = await userService.update(updates);
        if (res.success) {
          set({ currentUser: res.data });
          message.success('个人信息已更新');
          return true;
        } else {
          message.error(res.msg);
          return false;
        }
      },

      fetchUserDetail: async () => {
        const res = await userService.detail();
        if (res.success) {
          set({ 
            currentUser: res.data.user, 
            bindingRelations: res.data.bindingRelations,
            isLoggedIn: true 
          });
        }
      },
    })
);
