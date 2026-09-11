import { db } from '@/lib/mockData';
import { mockApi } from '@/lib/apiHelpers';
import type { AiChatResponse } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') ?? '').trim();

  const lower = query.toLowerCase();
  const matched = db.products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower) ||
      query.includes(p.brand),
  );
  const results = matched.length > 0 ? matched : db.products.slice(0, 3);

  const payload: AiChatResponse = {
    query,
    parsed: { brand: '', model: '', category: '' },
    results,
    total: results.length,
  };

  // AI对话延迟更长(800-1300ms),失败率更低(8%)
  return mockApi(payload, {
    minDelay: 800,
    maxDelay: 1300,
    failRate: 0.08,
  });
}
