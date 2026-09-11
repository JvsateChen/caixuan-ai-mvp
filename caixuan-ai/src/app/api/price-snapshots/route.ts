/* 价格快照 — 切换为真实 DB 查询 */
import { NextResponse } from 'next/server';
import { getPriceSnapshots } from '@/lib/db/queries';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  const snapshots = getPriceSnapshots();
  return mockApi(snapshots, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}
