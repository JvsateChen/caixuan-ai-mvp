import { db } from '@/lib/mockData';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  return mockApi(db.weeklyReview, { minDelay: 800, maxDelay: 1100, failRate: 0.1 });
}
