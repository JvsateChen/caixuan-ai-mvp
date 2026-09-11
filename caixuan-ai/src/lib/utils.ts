/* ============================================================
   采选AI平台 · 工具函数
   参照 app.js 中 Utils 对象
   ============================================================ */

import type { Trend } from './types';
import { PLATFORM_COLORS, type PlatformName } from './types';

/** 格式化价格 */
export function formatPrice(val: number): string {
  return '¥' + val.toLocaleString('zh-CN');
}

/** 趋势文本 */
export function trendText(trend: Trend): string {
  if (trend === 'down') return '降价';
  if (trend === 'up') return '涨价';
  return '持平';
}

/** 趋势CSS颜色类 */
export function trendColorClass(trend: Trend): string {
  if (trend === 'down') return 'price-down';
  if (trend === 'up') return 'price-up';
  return 'price-flat';
}

/** 获取平台颜色 */
export function platformColor(name: PlatformName): string {
  return PLATFORM_COLORS[name] ?? '#94a3b8';
}

/** 商品图片URL */
const PRODUCT_IMAGE_URLS: Record<string, string> = {
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
  cosmetic: 'https://images.unsplash.com/photo-1620916566398-39f7f9a93c1c?w=400&h=400&fit=crop',
  headphone: 'https://images.unsplash.com/photo-1505740420928-8f3a9a4d0a1c?w=400&h=400&fit=crop',
  appliance: 'https://images.unsplash.com/photo-1558317374-067fb5f29001?w=400&h=400&fit=crop',
};

/** 商品图片URL (带 fallback) */
export function productImageUrl(type = 'phone'): string {
  return PRODUCT_IMAGE_URLS[type] ?? PRODUCT_IMAGE_URLS.phone;
}

/** 模拟API延迟 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 随机延迟 (500-1100ms) */
export function randomDelay(min = 500, max = 1100): number {
  return min + Math.floor(Math.random() * (max - min));
}

/** 随机失败 (8-15%) */
export function shouldFail(failRate = 0.12): boolean {
  return Math.random() < failRate;
}

/** 深拷贝 (用于模拟API返回新对象) */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** 格式化数字 (千分位) */
export function formatNumber(val: number): string {
  return val.toLocaleString('zh-CN');
}

/** 格式化为万元 */
export function formatWan(val: number): string {
  return '¥' + (val / 10000).toFixed(1) + '万';
}

/** 类名合并 (简单版) */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
