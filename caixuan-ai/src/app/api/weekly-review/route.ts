/* 周报复盘 — 查询 + 手动生成 */
import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyReview } from '@/lib/db/queries';
import { generateWeeklyReview, getLatestWeeklyReview } from '@/services/weeklyReview';
import { getCurrentUser } from '@/lib/auth';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  const review = getWeeklyReview();
  if (!review) {
    return mockApi(null, { minDelay: 300, maxDelay: 600, failRate: 0 });
  }
  return mockApi(review, { minDelay: 300, maxDelay: 600, failRate: 0.05 });
}

/** 手动触发生成周报 */
export async function POST(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const userId = user?.id;

  const review = generateWeeklyReview(userId);
  if (!review) {
    return NextResponse.json({ code: 500, message: '生成失败' }, { status: 500 });
  }
  return NextResponse.json({ success: true, review });
}
