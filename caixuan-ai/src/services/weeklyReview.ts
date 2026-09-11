/* ============================================================
   采选AI平台 · 周报自动生成服务
   统计本周采购记录, 生成周报复盘数据
   ============================================================ */

import { getDb } from '@/lib/db';
import type { WeeklyReview, BestDeal } from '@/lib/types';

/** 生成周报复盘数据 */
export function generateWeeklyReview(userId?: string): WeeklyReview | null {
  const db = getDb();

  // 计算本周日期范围 (周一到周日)
  const now = new Date();
  const day = now.getDay() || 7; // 周日 = 0 → 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const mondayStr = monday.toISOString().slice(0, 10);
  const sundayStr = sunday.toISOString().slice(0, 10);
  const weekRange = `${mondayStr} ~ ${sundayStr}`;

  // 查询本周采购记录
  const records = userId
    ? db.prepare(`
      SELECT * FROM purchase_records
      WHERE user_id = ? AND order_date >= ? AND order_date <= ?
      ORDER BY order_date DESC
    `).all(userId, mondayStr, sundayStr) as any[]
    : db.prepare(`
      SELECT * FROM purchase_records
      WHERE order_date >= ? AND order_date <= ?
      ORDER BY order_date DESC
    `).all(mondayStr, sundayStr) as any[];

  // 查询上周记录 (计算环比)
  const lastMonday = new Date(monday);
  lastMonday.setDate(monday.getDate() - 7);
  const lastSunday = new Date(sunday);
  lastSunday.setDate(sunday.getDate() - 7);
  const lastMondayStr = lastMonday.toISOString().slice(0, 10);
  const lastSundayStr = lastSunday.toISOString().slice(0, 10);

  const lastRecords = db.prepare(`
    SELECT total, commission FROM purchase_records
    WHERE order_date >= ? AND order_date <= ?
  `).all(lastMondayStr, lastSundayStr) as { total: number; commission: number }[];

  // 统计本周
  const totalSavings = records.reduce((sum, r) => {
    // 计算 savings: 假设 commission 是节省金额的 3%, savings = commission / 0.03
    return sum + (r.commission ? r.commission / 0.03 : 0);
  }, 0);

  const commissionEarned = records.reduce((sum, r) => sum + (r.commission || 0), 0);
  const lastSavings = lastRecords.reduce((sum, r) => sum + (r.commission ? r.commission / 0.03 : 0), 0);

  // 计算环比
  const savingsChange = lastSavings > 0 ? ((totalSavings - lastSavings) / lastSavings) * 100 : 100;

  // 生成最佳交易 (按 commission 降序取前3)
  const bestDeals: BestDeal[] = records
    .filter((r) => r.commission > 0)
    .sort((a, b) => b.commission - a.commission)
    .slice(0, 3)
    .map((r) => ({
      productId: r.product_id,
      name: r.product_name,
      platform: r.platform,
      saved: Math.round(r.commission / 0.03),
      originalPrice: r.price + Math.round(r.commission / 0.03),
      finalPrice: r.price,
    }));

  const review: WeeklyReview = {
    weekRange,
    totalSavings: Math.round(totalSavings),
    itemsCompared: records.length,
    ordersPlaced: records.length,
    commissionEarned: Math.round(commissionEarned * 100) / 100,
    bestDeals,
    trend: savingsChange >= 0 ? 'up' : 'down',
    savingsChange: Math.round(savingsChange * 10) / 10,
  };

  // 写入数据库
  const id = `WR-${Date.now()}`;
  db.prepare(`
    INSERT OR REPLACE INTO weekly_reviews
    (id, user_id, week_range, total_savings, items_compared, orders_placed, commission_earned, trend, savings_change, best_deals_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId || null,
    review.weekRange,
    review.totalSavings,
    review.itemsCompared,
    review.ordersPlaced,
    review.commissionEarned,
    review.trend,
    review.savingsChange,
    JSON.stringify(review.bestDeals),
  );

  return review;
}

/** 获取最新周报 (优先从 DB 读取, 不存在则实时生成) */
export function getLatestWeeklyReview(userId?: string): WeeklyReview | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM weekly_reviews ORDER BY created_at DESC LIMIT 1
  `).get() as any;

  if (row) {
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

  // 不存在则实时生成
  return generateWeeklyReview(userId);
}
