/* 周报复盘 — 切换为真实 DB 查询 */
import { NextResponse } from 'next/server';
import { getWeeklyReview } from '@/lib/db/queries';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  const review = getWeeklyReview();
  if (!review) {
    return mockApi(null, { minDelay: 300, maxDelay: 600, failRate: 0 });
  }
  return mockApi(review, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}
