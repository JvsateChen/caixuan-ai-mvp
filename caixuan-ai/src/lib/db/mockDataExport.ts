/* ============================================================
   桥接层: 从 mockData.ts 导出数据给 seed 脚本
   运行时不再直接 import mockData, 仅 seed 时使用
   ============================================================ */

import { db as mockDb } from '@/lib/mockData';
import type { Product } from '@/lib/types';

export const mockDataProducts: Product[] = mockDb.products;

export const mockDataAll = {
  monitoringTargets: mockDb.monitoringTargets,
  priceSnapshots: mockDb.priceSnapshots,
  purchaseRecords: mockDb.purchaseRecords,
  weeklyReview: mockDb.weeklyReview,
  enterpriseOrders: mockDb.enterpriseOrders,
  enterpriseStats: mockDb.enterpriseStats,
  popularSearches: mockDb.popularSearches,
};
