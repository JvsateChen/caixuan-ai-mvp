/* 价格历史 — 切换为真实 DB 查询 */
import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistory } from '@/lib/db/queries';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId') ?? 'P001';

  const history = getPriceHistory(productId);
  return mockApi(history, { minDelay: 700, maxDelay: 1100, failRate: 0.1 });
}
