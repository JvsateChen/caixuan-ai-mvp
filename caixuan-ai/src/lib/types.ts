/* ============================================================
   采选AI平台 · TypeScript 数据模型
   完整类型定义 - 参照 DEVELOPMENT_SPEC.html 数据模型
   ============================================================ */

/** 价格趋势 */
export type Trend = 'down' | 'up' | 'flat';

/** 平台名 */
export type PlatformName = '拼多多' | '京东' | '淘宝';

/** 平台色映射 */
export const PLATFORM_COLORS: Record<PlatformName, string> = {
  拼多多: '#e02130',
  京东: '#1677ff',
  淘宝: '#ff6a00',
};

/** 商品图片类型 */
export type ProductImageType = 'phone' | 'cosmetic' | 'headphone' | 'appliance';

/** 单个平台报价 */
export interface PlatformQuote {
  name: PlatformName;
  price: number;
  prevPrice: number;
  trend: Trend;
  delta: number;
  url: string;
}

/** 商品 */
export interface Product {
  id: string;
  name: string;
  brand: string;
  spec: string;
  category: string;
  image: ProductImageType;
  platforms: PlatformQuote[];
  targetPrice: number;
  lowest: number;
  sparkline: number[];
}

/** 监控目标状态 */
export type MonitoringStatus = 'achieved' | 'monitoring';

/** 监控目标 */
export interface MonitoringTarget {
  id: string;
  productId: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  platform: PlatformName;
  status: MonitoringStatus;
  createdAt: string;
  trend: Trend;
}

/** 价格快照 */
export interface PriceSnapshot {
  id: string;
  productId: string;
  productName: string;
  platform: PlatformName;
  price: number;
  prevPrice: number;
  change: number;
  trend: Trend;
  snapshotAt: string;
}

/** 采购订单状态 */
export type PurchaseStatus = 'completed' | 'pending';

/** 采购记录 */
export interface PurchaseRecord {
  id: string;
  productId: string;
  productName: string;
  platform: PlatformName;
  price: number;
  qty: number;
  total: number;
  status: PurchaseStatus;
  orderDate: string;
  commission: number;
}

/** 周报复盘最佳交易 */
export interface BestDeal {
  productId: string;
  name: string;
  platform: PlatformName;
  saved: number;
  originalPrice: number;
  finalPrice: number;
}

/** 周报复盘 */
export interface WeeklyReview {
  weekRange: string;
  totalSavings: number;
  itemsCompared: number;
  ordersPlaced: number;
  commissionEarned: number;
  bestDeals: BestDeal[];
  trend: Trend;
  savingsChange: number;
}

/** 企业订单状态 */
export type EnterpriseOrderStatus = 'approved' | 'pending' | 'completed';

/** 企业订单 */
export interface EnterpriseOrder {
  id: string;
  title: string;
  supplier: string;
  items: number;
  total: number;
  status: EnterpriseOrderStatus;
  date: string;
  buyer: string;
}

/** 支出分类 */
export interface SpendCategory {
  name: string;
  value: number;
  pct: number;
}

/** 供应商对比 */
export interface SupplierCompare {
  name: string;
  orders: number;
  total: number;
  avgTime: number;
  rating: number;
}

/** 企业统计 */
export interface EnterpriseStats {
  monthlySpend: number;
  monthlyOrders: number;
  avgDiscount: number;
  suppliers: number;
  spendByCategory: SpendCategory[];
  supplierCompare: SupplierCompare[];
}

/** AI对话响应 */
export interface AiChatResponse {
  query: string;
  parsed: { brand: string; model: string; category: string };
  results: Product[];
  total: number;
}

/** 价格历史平台 */
export interface PriceHistoryPlatform {
  name: PlatformName;
  color: string;
  data: number[];
}

/** 价格历史统计 */
export interface PriceHistoryStats {
  highest: number;
  lowest: number;
  avg: number;
  current: number;
}

/** 价格历史 */
export interface PriceHistory {
  dates: string[];
  platforms: PriceHistoryPlatform[];
  stats: PriceHistoryStats;
}

/** 价格预警设置响应 */
export interface PriceAlertResponse {
  success: boolean;
  id: string;
}

/** API错误 */
export interface ApiError {
  code: number;
  message: string;
}

/** Toast 类型 */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/** Toast 配置 */
export interface ToastConfig {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  retryFn?: (() => void) | null;
}

/** 数据库 */
export interface DB {
  products: Product[];
  monitoringTargets: MonitoringTarget[];
  priceSnapshots: PriceSnapshot[];
  purchaseRecords: PurchaseRecord[];
  weeklyReview: WeeklyReview;
  enterpriseOrders: EnterpriseOrder[];
  enterpriseStats: EnterpriseStats;
  popularSearches: string[];
}
