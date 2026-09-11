/* ============================================================
   采选AI平台 · 数据库查询层
   封装所有 DB 查询, 替代 mockData 直接引用
   ============================================================ */

import { getDb } from './index';
import type {
  Product,
  PlatformQuote,
  MonitoringTarget,
  PriceSnapshot,
  PurchaseRecord,
  WeeklyReview,
  BestDeal,
  EnterpriseOrder,
  EnterpriseStats,
  SpendCategory,
  SupplierCompare,
  AiChatResponse,
  PriceHistory,
  PriceHistoryPlatform,
  PriceHistoryStats,
} from '@/lib/types';
import { PLATFORM_COLORS } from '@/lib/types';

/** 查询全部商品 (含平台报价) */
export function getProducts(): Product[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM products ORDER BY created_at
  `).all() as any[];

  return rows.map((r) => mapRowToProduct(r));
}

/** 按 ID 查询商品 */
export function getProductById(id: string): Product | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id) as any;
  if (!row) return null;
  return mapRowToProduct(row);
}

/** 按关键词搜索商品 */
export function searchProducts(query: string): Product[] {
  const db = getDb();
  const lower = query.toLowerCase();
  const rows = db.prepare(`
    SELECT * FROM products
    WHERE LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(spec) LIKE ?
    ORDER BY created_at
  `).all(`%${lower}%`, `%${lower}%`, `%${lower}%`) as any[];

  return rows.map((r) => mapRowToProduct(r));
}

/** 查询商品的监控目标 */
export function getMonitoringTargets(userId?: string): MonitoringTarget[] {
  const db = getDb();
  const rows = userId
    ? db.prepare(`SELECT * FROM monitoring_targets WHERE user_id = ? ORDER BY created_at DESC`).all(userId)
    : db.prepare(`SELECT * FROM monitoring_targets ORDER BY created_at DESC`).all();
  return rows as MonitoringTarget[];
}

/** 查询价格快照 */
export function getPriceSnapshots(): PriceSnapshot[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM price_snapshots ORDER BY snapshot_at DESC`).all() as PriceSnapshot[];
}

/** 查询采购记录 */
export function getPurchaseRecords(userId?: string): PurchaseRecord[] {
  const db = getDb();
  const rows = userId
    ? db.prepare(`SELECT * FROM purchase_records WHERE user_id = ? ORDER BY order_date DESC`).all(userId)
    : db.prepare(`SELECT * FROM purchase_records ORDER BY order_date DESC`).all();
  return rows as PurchaseRecord[];
}

/** 查询周报复盘 */
export function getWeeklyReview(): WeeklyReview | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM weekly_reviews ORDER BY created_at DESC LIMIT 1`).get() as any;
  if (!row) return null;

  const bestDeals: BestDeal[] = row.best_deals_json ? JSON.parse(row.best_deals_json) : [];
  return {
    weekRange: row.week_range,
    totalSavings: row.total_savings,
    itemsCompared: row.items_compared,
    ordersPlaced: row.orders_placed,
    commissionEarned: row.commission_earned,
    bestDeals,
    trend: row.trend,
    savingsChange: row.savings_change,
  };
}

/** 查询企业订单 */
export function getEnterpriseOrders(): EnterpriseOrder[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM enterprise_orders ORDER BY date DESC`).all() as EnterpriseOrder[];
}

/** 查询企业统计 */
export function getEnterpriseStats(): EnterpriseStats | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM enterprise_stats ORDER BY created_at DESC LIMIT 1`).get() as any;
  if (!row) return null;

  const spendByCategory: SpendCategory[] = row.spend_categories ? JSON.parse(row.spend_categories) : [];
  const supplierCompare: SupplierCompare[] = row.supplier_compare ? JSON.parse(row.supplier_compare) : [];
  return {
    monthlySpend: row.monthly_spend,
    monthlyOrders: row.monthly_orders,
    avgDiscount: row.avg_discount,
    suppliers: row.suppliers,
    spendByCategory,
    supplierCompare,
  };
}

/** 查询热门搜索 */
export function getPopularSearches(): string[] {
  const db = getDb();
  const rows = db.prepare(`SELECT term FROM popular_searches ORDER BY count DESC`).all() as { term: string }[];
  return rows.map((r) => r.term);
}

/** 创建价格预警 */
export function createPriceAlert(userId: string, productId: string, targetPrice: number): { success: boolean; id: string } {
  const db = getDb();
  const id = `ALERT-${Date.now()}`;
  db.prepare(`
    INSERT INTO price_alerts (id, user_id, product_id, target_price, status)
    VALUES (?, ?, ?, ?, 'active')
  `).run(id, userId, productId, targetPrice);
  return { success: true, id };
}

/** 生成价格历史数据 (基于 sparkline + 扰动) */
export function getPriceHistory(productId: string): PriceHistory {
  const db = getDb();
  const product = getProductById(productId);

  // 生成30天日期
  const dates: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }

  // 从 DB 查询真实历史数据 (如果存在)
  const dbHistory = db.prepare(`
    SELECT platform, price, recorded_at FROM price_history
    WHERE product_id = ? ORDER BY recorded_at
  `).all(productId) as { platform: string; price: number; recorded_at: string }[];

  // 如果有真实历史数据, 使用它
  if (dbHistory.length >= 30) {
    const platforms: PriceHistoryPlatform[] = [];
    const grouped: Record<string, number[]> = {};
    for (const r of dbHistory) {
      if (!grouped[r.platform]) grouped[r.platform] = [];
      grouped[r.platform].push(r.price);
    }
    for (const [name, data] of Object.entries(grouped)) {
      platforms.push({ name: name as any, color: PLATFORM_COLORS[name as keyof typeof PLATFORM_COLORS], data });
    }
    const allPrices = platforms.flatMap((p) => p.data);
    const stats: PriceHistoryStats = {
      highest: Math.max(...allPrices),
      lowest: Math.min(...allPrices),
      avg: Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length),
      current: allPrices[allPrices.length - 1],
    };
    return { dates, platforms, stats };
  }

  // 否则用 sparkline + 扰动 (降级方案)
  const sparkline = product?.sparkline ?? [100, 100, 100];
  const jitter = (base: number[], range: number) =>
    base.map((v) => v + Math.round((Math.random() - 0.5) * 2 * range));

  return {
    dates,
    platforms: [
      { name: '拼多多', color: PLATFORM_COLORS['拼多多'], data: sparkline },
      { name: '京东', color: PLATFORM_COLORS['京东'], data: jitter(sparkline, 100) },
      { name: '淘宝', color: PLATFORM_COLORS['淘宝'], data: jitter(sparkline, 150) },
    ],
    stats: {
      highest: Math.max(...sparkline),
      lowest: Math.min(...sparkline),
      avg: Math.round(sparkline.reduce((a, b) => a + b, 0) / sparkline.length),
      current: product?.lowest ?? sparkline[sparkline.length - 1],
    },
  };
}

// ============================================================
// 辅助函数
// ============================================================

/** 将 DB 行映射为 Product 对象 */
function mapRowToProduct(row: any): Product {
  const db = getDb();
  const quotes = db.prepare(`
    SELECT platform as name, price, prev_price as prevPrice, trend, delta, url
    FROM product_quotes WHERE product_id = ?
  `).all(row.id) as PlatformQuote[];

  const sparkline: number[] = row.sparkline ? JSON.parse(row.sparkline) : [];

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    spec: row.spec,
    category: row.category,
    image: row.image_type,
    platforms: quotes,
    targetPrice: row.target_price,
    lowest: row.lowest,
    sparkline,
  };
}
