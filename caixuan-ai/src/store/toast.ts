/* ============================================================
   采选AI平台 · Toast 状态管理 (Zustand)
   参照 app.js 中 Toast 对象
   ============================================================ */

'use client';

import { create } from 'zustand';
import type { ToastConfig, ToastType } from '@/lib/types';

export interface ToastItem extends Required<Omit<ToastConfig, 'retryFn'>> {
  id: string;
  retryFn: (() => void) | null;
  retry?: () => void;
}

interface ToastState {
  toasts: ToastItem[];
  show: (config: ToastConfig) => string;
  remove: (id: string) => void;
  clear: () => void;
  error: (title: string, message: string, retryFn?: (() => void) | null) => string;
  success: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

let counter = 0;
const nextId = () => `toast-${++counter}`;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show: (config) => {
    const id = nextId();
    const retryFn = config.retryFn ?? null;
    const item: ToastItem = {
      id,
      type: config.type ?? 'info',
      title: config.title,
      message: config.message ?? '',
      duration: config.duration ?? 3500,
      retryFn,
      retry: retryFn ?? undefined,
    };
    set((s) => ({ toasts: [...s.toasts, item] }));
    if (item.duration > 0) {
      setTimeout(() => get().remove(id), item.duration);
    }
    return id;
  },

  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),

  error: (title, message, retryFn = null) =>
    get().show({ type: 'error', title, message, duration: 6000, retryFn }),

  success: (title, message = '') =>
    get().show({ type: 'success', title, message, duration: 3000 }),

  warning: (title, message = '') =>
    get().show({ type: 'warning', title, message, duration: 4000 }),

  info: (title, message = '') =>
    get().show({ type: 'info', title, message, duration: 3000 }),
}));

/** 在非组件上下文使用的便捷方法 */
export const toast = {
  show: (cfg: ToastConfig) => useToastStore.getState().show(cfg),
  error: (t: string, m: string, r?: (() => void) | null) =>
    useToastStore.getState().error(t, m, r),
  success: (t: string, m?: string) => useToastStore.getState().success(t, m),
  warning: (t: string, m?: string) => useToastStore.getState().warning(t, m),
  info: (t: string, m?: string) => useToastStore.getState().info(t, m),
};
