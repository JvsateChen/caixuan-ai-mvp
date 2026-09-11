/* ============================================================
   采选AI平台 · 比价引擎
   排序、最优价计算、趋势分析
   ============================================================ */

import type { Product, PlatformQuote, Trend } from '@/lib/types';

/** 比价排序方式 */
export type SortBy = 'price' | 'delta' | 'platform';

/** 找到最优价 (最低价平台) */
export function findBestPrice(product: Product): PlatformQuote {
  return product.platforms.reduce(
    (min, p) => (p.price < min.price ? p : min),
    product.platforms[0],
  );
}

/** 按价格排序商品 (最优价升序) */
export function sortByBestPrice(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aBest = findBestPrice(a).price;
    const bBest = findBestPrice(b).price;
    return aBest - bBest;
  });
}

/** 按价格降幅排序 */
export function sortByMaxDelta(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aDelta = findBestPrice(a).delta;
    const bDelta = findBestPrice(b).delta;
    return aDelta - bDelta; // 负数 (降幅大) 排前
  });
}

/** 统计价格信息 */
export function getPriceStats(products: Product[]): {
  total: number;
  bestCount: number;
  avgSavings: number;
} {
  let bestCount = 0;
  let totalSavings = 0;

  for (const p of products) {
    const best = findBestPrice(p);
    if (best.delta < 0) {
      bestCount++;
      totalSavings += Math.abs(best.delta);
    }
  }

  return {
    total: products.length,
    bestCount,
    avgSavings: products.length > 0 ? Math.round(totalSavings / products.length) : 0,
  };
}

/** 判断是否达到目标价 */
export function isTargetAchieved(product: Product): boolean {
  return product.lowest <= product.targetPrice;
}

/** 计算价格趋势 */
export function calculateTrend(current: number, prev: number): { trend: Trend; delta: number } {
  const delta = current - prev;
  if (delta < 0) return { trend: 'down', delta };
  if (delta > 0) return { trend: 'up', delta };
  return { trend: 'flat', delta: 0 };
}
