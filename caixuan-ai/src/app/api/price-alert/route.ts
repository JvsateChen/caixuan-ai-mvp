/* 价格预警 — 切换为真实 DB 写入 */
import { NextRequest, NextResponse } from 'next/server';
import { createPriceAlert } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId') ?? '';
  const targetPrice = Number(searchParams.get('targetPrice') ?? 0);

  if (!productId || targetPrice <= 0) {
    return NextResponse.json(
      { code: 400, message: '参数错误' },
      { status: 400 },
    );
  }

  // 获取当前用户 (未登录使用 demo-user)
  const user = getCurrentUser(req as any);
  const userId = user?.id || 'demo-user';

  const result = createPriceAlert(userId, productId, targetPrice);
  // 写入操作失败率略高 (15%)
  return mockApi(result, { minDelay: 400, maxDelay: 800, failRate: 0.15 });
}
