import { db } from '@/lib/mockData';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = db.products.find((p) => p.id === id) ?? db.products[0];
  return mockApi(product, { minDelay: 600, maxDelay: 1100, failRate: 0.1 });
}
