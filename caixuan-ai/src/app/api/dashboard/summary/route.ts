/* 看板汇总数据 — 一次请求获取全部看板数据 */
import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringTargets, getPriceSnapshots, getPurchaseRecords } from '@/lib/db/queries';
import { getLatestWeeklyReview } from '@/services/weeklyReview';
import { getCurrentUser } from '@/lib/auth';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const userId = user?.id || 'demo-user';

  const [targets, snapshots, records, weeklyReview] = [
    getMonitoringTargets(userId),
    getPriceSnapshots(),
    getPurchaseRecords(userId),
    getLatestWeeklyReview(userId),
  ];

  const summary = {
    monitoringTargets: targets,
    priceSnapshots: snapshots,
    purchaseRecords: records,
    weeklyReview,
    stats: {
      monitoringCount: targets.length,
      achievedCount: targets.filter((t) => t.status === 'achieved').length,
      snapshotCount: snapshots.length,
      orderCount: records.length,
      totalSpent: records.reduce((sum, r) => sum + r.total, 0),
    },
  };

  return mockApi(summary, { minDelay: 500, maxDelay: 900, failRate: 0.08 });
}
