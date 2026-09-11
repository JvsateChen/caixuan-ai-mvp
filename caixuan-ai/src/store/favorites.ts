/* ============================================================
   采选AI平台 · 收藏夹 / 预警开关状态 (Zustand)
   ============================================================ */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[]; // productId 列表
  alertEnabled: Record<string, boolean>; // productId -> 开关
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setAlert: (productId: string, on: boolean) => void;
  isAlertOn: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: ['P001', 'P002', 'P004'],
      alertEnabled: { P001: true, P002: true, P004: false },

      toggleFavorite: (productId) =>
        set((s) => {
          const exists = s.favorites.includes(productId);
          return {
            favorites: exists
              ? s.favorites.filter((id) => id !== productId)
              : [...s.favorites, productId],
          };
        }),

      isFavorite: (productId) => get().favorites.includes(productId),

      setAlert: (productId, on) =>
        set((s) => ({
          alertEnabled: { ...s.alertEnabled, [productId]: on },
        })),

      isAlertOn: (productId) => get().alertEnabled[productId] ?? false,
    }),
    {
      name: 'caixuan-favorites',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
