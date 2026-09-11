/* ============================================================
   采选AI平台 · 商品搜索服务
   封装商品搜索逻辑, 支持 DB 全文搜索
   ============================================================ */

import { searchProducts, getProducts, getProductById } from '@/lib/db/queries';
import type { Product } from '@/lib/types';

/** 搜索商品 */
export function search(keyword: string): Product[] {
  const results = searchProducts(keyword);
  return results;
}

/** 获取全部商品 (带分页) */
export function getAll(page: number = 1, pageSize: number = 20): { products: Product[]; total: number } {
  const all = getProducts();
  const start = (page - 1) * pageSize;
  return {
    products: all.slice(start, start + pageSize),
    total: all.length,
  };
}

/** 按 ID 获取商品 */
export function getById(id: string): Product | null {
  return getProductById(id);
}
