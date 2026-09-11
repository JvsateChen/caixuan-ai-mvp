import { db } from '@/lib/mockData';
import { mockApi } from '@/lib/apiHelpers';
import { PLATFORM_COLORS } from '@/lib/types';
import type { PriceHistory } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId') ?? 'P001';
  const product =
    db.products.find((p) => p.id === productId) ?? db.products[0];

  // 生成 30 天日期
  const dates: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }

  // 三平台数据(基于sparkline + 随机扰动)
  const jitter = (base: number[], range: number) =>
    base.map((v) => v + Math.round((Math.random() - 0.5) * 2 * range));

  const payload: PriceHistory = {
    dates,
    platforms: [
      { name: '拼多多', color: PLATFORM_COLORS['拼多多'], data: product.sparkline },
      {
        name: '京东',
        color: PLATFORM_COLORS['京东'],
        data: jitter(product.sparkline, 100),
      },
      {
        name: '淘宝',
        color: PLATFORM_COLORS['淘宝'],
        data: jitter(product.sparkline, 150),
      },
    ],
    stats: {
      highest: Math.max(...product.sparkline),
      lowest: Math.min(...product.sparkline),
      avg: Math.round(
        product.sparkline.reduce((a, b) => a + b, 0) /
          product.sparkline.length,
      ),
      current: product.lowest,
    },
  };

  return mockApi(payload, { minDelay: 700, maxDelay: 1100, failRate: 0.1 });
}
