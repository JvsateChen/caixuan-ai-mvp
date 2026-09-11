/* 企业统计 — 切换为真实 DB 查询 */
import { NextResponse } from 'next/server';
import { getEnterpriseStats } from '@/lib/db/queries';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  const stats = getEnterpriseStats();
  if (!stats) {
    return mockApi(null, { minDelay: 300, maxDelay: 600, failRate: 0 });
  }
  return mockApi(stats, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}
