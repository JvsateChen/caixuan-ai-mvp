/* 企业数据分析 — 支出分析 (按类目/部门/时间维度) */
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const guard = requirePermission(user, 'analytics:view');
  if (!guard.allowed) {
    return NextResponse.json({ code: 403, message: guard.error }, { status: 403 });
  }

  const db = getDb();
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get('year') || new Date().getFullYear());

  // 1. 按月支出趋势
  const monthlyTrend = db.prepare(`
    SELECT substr(date, 1, 7) as month, SUM(total) as spend, COUNT(*) as orders
    FROM enterprise_orders
    WHERE substr(date, 1, 4) = ?
    GROUP BY month ORDER BY month
  `).all(String(year)) as { month: string; spend: number; orders: number }[];

  // 2. 按供应商支出
  const supplierSpend = db.prepare(`
    SELECT supplier, SUM(total) as spend, COUNT(*) as orders
    FROM enterprise_orders
    WHERE substr(date, 1, 4) = ?
    GROUP BY supplier ORDER BY spend DESC
  `).all(String(year)) as { supplier: string; spend: number; orders: number }[];

  // 3. 订单状态分布
  const statusDist = db.prepare(`
    SELECT status, COUNT(*) as count, SUM(total) as total
    FROM enterprise_orders
    WHERE substr(date, 1, 4) = ?
    GROUP BY status
  `).all(String(year)) as { status: string; count: number; total: number }[];

  // 4. 年度汇总
  const yearlySummary = db.prepare(`
    SELECT COUNT(*) as total_orders, SUM(total) as total_spend, AVG(total) as avg_order
    FROM enterprise_orders
    WHERE substr(date, 1, 4) = ?
  `).get(String(year)) as { total_orders: number; total_spend: number; avg_order: number };

  return NextResponse.json({
    year,
    monthlyTrend,
    supplierSpend,
    statusDist,
    yearlySummary: {
      totalOrders: yearlySummary?.total_orders || 0,
      totalSpend: yearlySummary?.total_spend || 0,
      avgOrder: Math.round(yearlySummary?.avg_order || 0),
    },
  });
}
