/* 商品详情 — 切换为真实 DB 查询 */
import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/db/queries';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') ?? '';

  const product = getProductById(id);
  if (!product) {
    return NextResponse.json(
      { code: 404, message: '商品不存在' },
      { status: 404 },
    );
  }
  return mockApi(product, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}
