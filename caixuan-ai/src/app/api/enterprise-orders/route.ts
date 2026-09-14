/* 企业订单 — 查询 + 创建 */
import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/services/enterprise';
import { getCurrentUser } from '@/lib/auth';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  const orders = getOrders();
  return mockApi(orders, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ code: 401, message: '请先登录' }, { status: 401 });
  }

  const body = await req.json();
  const { title, supplier, items, total } = body;

  if (!title || !supplier || !total) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }

  const order = createOrder({
    title,
    supplier,
    items: items || 1,
    total,
    buyer: user.nickname,
    buyerId: user.id,
  });

  return NextResponse.json({ success: true, order });
}
