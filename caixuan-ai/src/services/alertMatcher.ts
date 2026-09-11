/* ============================================================
   采选AI平台 · 预警匹配引擎
   遍历用户预警规则, 比对当前价格, 触发通知
   ============================================================ */

import { getDb } from '@/lib/db';
import { findBestPrice } from './priceCompare';
import { notifyInApp, notifyWechat, notifySms } from './notifier';

export interface AlertMatchResult {
  alertId: string;
  userId: string;
  productId: string;
  productName: string;
  platform: string;
  targetPrice: number;
  currentPrice: number;
  notified: boolean;
}

/** 巡检全部活跃预警 */
export async function runAlertCheck(): Promise<AlertMatchResult[]> {
  const db = getDb();
  const alerts = db.prepare(`
    SELECT a.id, a.user_id, a.product_id, a.target_price,
           p.name as product_name
    FROM price_alerts a
    JOIN products p ON a.product_id = p.id
    WHERE a.status = 'active'
  `).all() as any[];

  const results: AlertMatchResult[] = [];

  for (const alert of alerts) {
    // 查询商品当前最低价
    const quotes = db.prepare(`
      SELECT platform, price FROM product_quotes WHERE product_id = ?
    `).all(alert.product_id) as { platform: string; price: number }[];

    if (quotes.length === 0) continue;

    const best = quotes.reduce((min, q) => (q.price < min.price ? q : min), quotes[0]);

    // 检查是否达到目标价
    if (best.price <= alert.target_price) {
      const result: AlertMatchResult = {
        alertId: alert.id,
        userId: alert.user_id,
        productId: alert.product_id,
        productName: alert.product_name,
        platform: best.platform,
        targetPrice: alert.target_price,
        currentPrice: best.price,
        notified: false,
      };

      // 触发通知 (多渠道)
      try {
        const message = `${alert.product_name} 在${best.platform}已降至 ¥${best.price}，达到您设置的目标价 ¥${alert.target_price}`;

        await Promise.allSettled([
          notifyInApp(alert.user_id, {
            type: 'price_alert',
            title: '价格预警触发',
            message,
          }),
          notifyWechat(alert.user_id, message),
          notifySms(alert.user_id, message),
        ]);

        result.notified = true;

        // 标记预警为已触发
        db.prepare(`
          UPDATE price_alerts SET status = 'triggered', triggered_at = datetime('now')
          WHERE id = ?
        `).run(alert.id);
      } catch {
        result.notified = false;
      }

      results.push(result);
    }
  }

  return results;
}

/** 检查监控目标是否达成 */
export function checkMonitoringTargets(): { targetId: string; achieved: boolean }[] {
  const db = getDb();
  const targets = db.prepare(`
    SELECT id, product_id, target_price, status
    FROM monitoring_targets WHERE status = 'monitoring'
  `).all() as any[];

  const results: { targetId: string; achieved: boolean }[] = [];

  for (const t of targets) {
    const quotes = db.prepare(`
      SELECT price FROM product_quotes WHERE product_id = ?
    `).all(t.product_id) as { price: number }[];

    if (quotes.length === 0) continue;

    const lowest = Math.min(...quotes.map((q) => q.price));

    if (lowest <= t.target_price) {
      db.prepare(`
        UPDATE monitoring_targets SET status = 'achieved' WHERE id = ?
      `).run(t.id);
      results.push({ targetId: t.id, achieved: true });
    }
  }

  return results;
}
