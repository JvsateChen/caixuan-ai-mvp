/* 单元测试 — 比价引擎 */
import { describe, it, expect } from 'vitest';
import {
  findBestPrice,
  sortByBestPrice,
  sortByMaxDelta,
  getPriceStats,
  isTargetAchieved,
  calculateTrend,
} from '@/services/priceCompare';
import type { Product } from '@/lib/types';

const mockProducts: Product[] = [
  {
    id: 'P001',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    spec: '256GB',
    category: '3C数码',
    image: 'phone',
    platforms: [
      { name: '拼多多', price: 7299, prevPrice: 7599, trend: 'down', delta: -300, url: '#' },
      { name: '京东', price: 7699, prevPrice: 7699, trend: 'flat', delta: 0, url: '#' },
      { name: '淘宝', price: 7499, prevPrice: 7399, trend: 'up', delta: 100, url: '#' },
    ],
    targetPrice: 7300,
    lowest: 7299,
    sparkline: [7300, 7299, 7299],
  },
  {
    id: 'P002',
    name: '兰蔻精华',
    brand: '兰蔻',
    spec: '50ml',
    category: '美妆护肤',
    image: 'cosmetic',
    platforms: [
      { name: '淘宝', price: 1080, prevPrice: 1180, trend: 'down', delta: -100, url: '#' },
      { name: '京东', price: 1120, prevPrice: 1120, trend: 'flat', delta: 0, url: '#' },
      { name: '拼多多', price: 1050, prevPrice: 1100, trend: 'down', delta: -50, url: '#' },
    ],
    targetPrice: 1060,
    lowest: 1050,
    sparkline: [1050, 1050, 1050],
  },
];

describe('findBestPrice — 找最优价', () => {
  it('返回最低价平台', () => {
    const best = findBestPrice(mockProducts[0]);
    expect(best.name).toBe('拼多多');
    expect(best.price).toBe(7299);
  });

  it('返回第二条商品的最低价', () => {
    const best = findBestPrice(mockProducts[1]);
    expect(best.price).toBe(1050);
  });
});

describe('sortByBestPrice — 按最优价排序', () => {
  it('最优价低的排前面', () => {
    const sorted = sortByBestPrice(mockProducts);
    expect(sorted[0].id).toBe('P002'); // 1050 < 7299
    expect(sorted[1].id).toBe('P001');
  });
});

describe('sortByMaxDelta — 按降幅排序', () => {
  it('降幅大的排前面', () => {
    const sorted = sortByMaxDelta(mockProducts);
    // P001 拼多多 delta=-300, P002 淘宝 delta=-100
    expect(sorted[0].id).toBe('P001'); // -300 < -100
  });
});

describe('getPriceStats — 价格统计', () => {
  it('统计降价商品数和平均节省', () => {
    const stats = getPriceStats(mockProducts);
    expect(stats.total).toBe(2);
    expect(stats.bestCount).toBe(2);
    expect(stats.avgSavings).toBeGreaterThan(0);
  });
});

describe('isTargetAchieved — 目标价判断', () => {
  it('P001 已达成目标价', () => {
    expect(isTargetAchieved(mockProducts[0])).toBe(true); // 7299 <= 7300
  });

  it('未达成目标价时返回false', () => {
    const p = { ...mockProducts[0], lowest: 7500 };
    expect(isTargetAchieved(p)).toBe(false);
  });
});

describe('calculateTrend — 趋势计算', () => {
  it('价格下降', () => {
    const r = calculateTrend(100, 150);
    expect(r.trend).toBe('down');
    expect(r.delta).toBe(-50);
  });

  it('价格上升', () => {
    const r = calculateTrend(200, 150);
    expect(r.trend).toBe('up');
    expect(r.delta).toBe(50);
  });

  it('价格持平', () => {
    const r = calculateTrend(100, 100);
    expect(r.trend).toBe('flat');
    expect(r.delta).toBe(0);
  });
});
