import { mockApi } from '@/lib/apiHelpers';
import type { PriceAlertResponse } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId') ?? '';
  const targetPrice = Number(searchParams.get('targetPrice') ?? 0);

  const payload: PriceAlertResponse = {
    success: true,
    id: 'ALERT-' + Date.now(),
  };
  // 写入操作失败率略高(15%)
  return mockApi(payload, { minDelay: 400, maxDelay: 800, failRate: 0.15 });
}
