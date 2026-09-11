/* 监控目标 — 查询 + 创建 */
import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringTargets } from '@/lib/db/queries';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const userId = user?.id || 'demo-user';
  const targets = getMonitoringTargets(userId);
  return mockApi(targets, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ code: 401, message: '请先登录' }, { status: 401 });
  }

  const body = await req.json();
  const { productId, productName, targetPrice, platform } = body;

  if (!productId || !targetPrice) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }

  const db = getDb();
  const id = `M-${Date.now()}`;
  const today = new Date().toISOString().slice(0, 10);

  // 查询当前价格
  const quotes = db.prepare('SELECT price FROM product_quotes WHERE product_id = ?').all(productId) as { price: number }[];
  const currentPrice = quotes.length > 0 ? Math.min(...quotes.map((q) => q.price)) : 0;

  db.prepare(`
    INSERT INTO monitoring_targets (id, user_id, product_id, product_name, target_price, current_price, platform, status, trend, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'monitoring', 'down', ?)
  `).run(id, user.id, productId, productName, targetPrice, currentPrice, platform || '拼多多', today);

  return mockApi({ success: true, id }, { minDelay: 300, maxDelay: 600, failRate: 0.1 });
}
