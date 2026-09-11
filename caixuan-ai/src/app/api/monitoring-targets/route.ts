/* 监控目标 — 切换为真实 DB 查询 */
import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringTargets } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const userId = user?.id || 'demo-user';
  const targets = getMonitoringTargets(userId);
  return mockApi(targets, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}
