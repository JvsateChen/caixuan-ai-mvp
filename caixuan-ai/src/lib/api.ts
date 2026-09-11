/* ============================================================
   采选AI平台 · 前端 API 客户端
   调用 Next.js API Routes
   ============================================================ */

import type {
  Product,
  AiChatResponse,
  PriceHistory,
  MonitoringTarget,
  PriceSnapshot,
  PurchaseRecord,
  WeeklyReview,
  EnterpriseOrder,
  EnterpriseStats,
  PriceAlertResponse,
  ApiError,
} from './types';

/** 获取 auth token (从 cookie) */
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/caixuan-token=([^;]+)/);
  return match ? match[1] : null;
}

/** 基础 fetch,统一错误处理, 自动携带 auth header */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let err: ApiError;
    try {
      err = await res.json();
    } catch {
      err = { code: res.status, message: `请求失败 (${res.status})` };
    }
    throw err;
  }
  return res.json() as Promise<T>;
}

export const api = {
  /** AI对话 */
  aiChat(query: string): Promise<AiChatResponse> {
    return apiFetch<AiChatResponse>(
      `/api/ai-chat?q=${encodeURIComponent(query)}`,
    );
  },

  /** 商品列表 */
  getProducts(): Promise<Product[]> {
    return apiFetch<Product[]>('/api/products');
  },

  /** 商品详情 */
  getProductDetail(id: string): Promise<Product> {
    return apiFetch<Product>(`/api/products/${encodeURIComponent(id)}`);
  },

  /** 价格历史 */
  getPriceHistory(productId: string): Promise<PriceHistory> {
    return apiFetch<PriceHistory>(
      `/api/price-history?productId=${encodeURIComponent(productId)}`,
    );
  },

  /** 监控目标 */
  getMonitoringTargets(): Promise<MonitoringTarget[]> {
    return apiFetch<MonitoringTarget[]>('/api/monitoring-targets');
  },

  /** 价格快照 */
  getPriceSnapshots(): Promise<PriceSnapshot[]> {
    return apiFetch<PriceSnapshot[]>('/api/price-snapshots');
  },

  /** 采购记录 */
  getPurchaseRecords(): Promise<PurchaseRecord[]> {
    return apiFetch<PurchaseRecord[]>('/api/purchase-records');
  },

  /** 周报复盘 */
  getWeeklyReview(): Promise<WeeklyReview> {
    return apiFetch<WeeklyReview>('/api/weekly-review');
  },

  /** 企业订单 */
  getEnterpriseOrders(): Promise<EnterpriseOrder[]> {
    return apiFetch<EnterpriseOrder[]>('/api/enterprise-orders');
  },

  /** 企业统计 */
  getEnterpriseStats(): Promise<EnterpriseStats> {
    return apiFetch<EnterpriseStats>('/api/enterprise-stats');
  },

  /** 热门搜索 */
  getPopularSearches(): Promise<string[]> {
    return apiFetch<string[]>('/api/popular-searches');
  },

  /** 设置价格预警 */
  setPriceAlert(
    productId: string,
    targetPrice: number,
  ): Promise<PriceAlertResponse> {
    return apiFetch<PriceAlertResponse>(
      `/api/price-alert?productId=${encodeURIComponent(
        productId,
      )}&targetPrice=${targetPrice}`,
    );
  },

  /** 看板汇总 (一次请求获取全部看板数据) */
  getDashboardSummary(): Promise<any> {
    return apiFetch<any>('/api/dashboard/summary');
  },

  /** 用户通知列表 */
  getNotifications(onlyUnread = false): Promise<any[]> {
    return apiFetch<any[]>(`/api/notifications${onlyUnread ? '?unread=true' : ''}`);
  },

  /** 标记通知为已读 */
  markNotificationRead(id: string): Promise<any> {
    return apiFetch<any>(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
  },

  /** 创建监控目标 */
  createMonitoringTarget(data: {
    productId: string;
    productName: string;
    targetPrice: number;
    platform?: string;
  }): Promise<any> {
    return apiFetch<any>('/api/monitoring-targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  /** 删除监控目标 */
  deleteMonitoringTarget(id: string): Promise<any> {
    return apiFetch<any>(`/api/monitoring-targets/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  /** 手动生成周报 */
  generateWeeklyReview(): Promise<any> {
    return apiFetch<any>('/api/weekly-review', { method: 'POST' });
  },
};
