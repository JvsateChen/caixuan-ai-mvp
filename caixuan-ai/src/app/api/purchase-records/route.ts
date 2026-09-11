/* 采购记录 — 切换为真实 DB 查询 */
import { NextRequest, NextResponse } from 'next/server';
import { getPurchaseRecords } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const userId = user?.id || 'demo-user';
  const records = getPurchaseRecords(userId);
  return mockApi(records, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}
