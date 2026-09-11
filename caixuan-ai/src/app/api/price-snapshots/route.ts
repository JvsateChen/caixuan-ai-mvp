import { db } from '@/lib/mockData';
import { mockApi } from '@/lib/apiHelpers';

export async function GET() {
  return mockApi(db.priceSnapshots, { failRate: 0.1 });
}
