/* 商品列表 — 切换为真实 DB 查询 */
import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/db/queries';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  const products = getProducts();
  return mockApi(products, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}
