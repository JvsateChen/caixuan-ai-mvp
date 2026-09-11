/* 热门搜索 — 切换为真实 DB 查询 */
import { NextResponse } from 'next/server';
import { getPopularSearches } from '@/lib/db/queries';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  const searches = getPopularSearches();
  return mockApi(searches, { minDelay: 200, maxDelay: 400, failRate: 0 });
}
