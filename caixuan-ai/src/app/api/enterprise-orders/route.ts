/* 企业订单 — 切换为真实 DB 查询 */
import { NextResponse } from 'next/server';
import { getEnterpriseOrders } from '@/lib/db/queries';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  const orders = getEnterpriseOrders();
  return mockApi(orders, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}
