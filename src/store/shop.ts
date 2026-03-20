import { create } from 'zustand';
import { ShopItems, UserItems } from '@/api/sql_models';

interface ShopState {
  shopItems: ShopItems[];
  userInventory: UserItems[]; // Should be keyed by user_id in real app, here simplified

  // Actions
}

export const useShopStore = create<ShopState>()(
    (set, get) => ({
      shopItems: [] as ShopItems[],
      userInventory: [] as UserItems[],
    })
);
