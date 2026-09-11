/* 集成测试 — 数据库查询 */
import { describe, it, expect, beforeAll } from 'vitest';
import { getDb, closeDb } from '@/lib/db';
import { getProducts, getProductById, searchProducts } from '@/lib/db/queries';

beforeAll(() => {
  // 初始化数据库
  getDb();
});

describe('数据库 — 商品查询', () => {
  it('getProducts 返回6个商品', () => {
    const products = getProducts();
    expect(products.length).toBe(6);
  });

  it('每个商品都有3个平台报价', () => {
    const products = getProducts();
    for (const p of products) {
      expect(p.platforms.length).toBe(3);
    }
  });

  it('getProductById 正确返回', () => {
    const product = getProductById('P001');
    expect(product).not.toBeNull();
    expect(product!.name).toContain('iPhone');
    expect(product!.brand).toBe('Apple');
  });

  it('getProductById 不存在返回null', () => {
    const product = getProductById('P999');
    expect(product).toBeNull();
  });
});

describe('数据库 — 商品搜索', () => {
  it('按品牌搜索 Apple', () => {
    const results = searchProducts('Apple');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].brand).toBe('Apple');
  });

  it('按商品名搜索 兰蔻', () => {
    const results = searchProducts('兰蔻');
    expect(results.length).toBe(1);
    expect(results[0].name).toContain('兰蔻');
  });

  it('搜索不存在的关键词返回空', () => {
    const results = searchProducts('不存在的商品');
    expect(results.length).toBe(0);
  });
});
