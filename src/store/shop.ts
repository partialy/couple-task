import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShopItems, UserItems } from '@/api/sql_models';

interface ShopState {
  shopItems: ShopItems[];
  userInventory: UserItems[]; // Should be keyed by user_id in real app, here simplified

  // Actions
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      shopItems: [] as ShopItems[],
      userInventory: [] as UserItems[],
    }),
    {
      name: 'yutask-shop-storage',
    }
  )
);
