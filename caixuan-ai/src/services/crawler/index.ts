/* ============================================================
   采选AI平台 · 三平台采集服务
   拼多多 / 京东 / 淘宝 商品价格采集
   开发环境: 返回 Mock 数据
   生产环境: 调用各平台开放 API
   ============================================================ */

import type { PlatformQuote } from '@/lib/types';

export interface CrawlResult {
  platform: string;
  price: number;
  prevPrice: number;
  trend: 'down' | 'up' | 'flat';
  delta: number;
  url: string;
  productName: string;
}

/** 按关键词采集三平台价格 */
export async function crawlByKeyword(keyword: string): Promise<CrawlResult[]> {
  const [pdd, jd, tb] = await Promise.allSettled([
    crawlPdd(keyword),
    crawlJd(keyword),
    crawlTaobao(keyword),
  ]);

  const results: CrawlResult[] = [];
  if (pdd.status === 'fulfilled') results.push(pdd.value);
  if (jd.status === 'fulfilled') results.push(jd.value);
  if (tb.status === 'fulfilled') results.push(tb.value);

  return results;
}

/** 拼多多采集 */
async function crawlPdd(keyword: string): Promise<CrawlResult> {
  // 生产环境: 调用拼多多开放平台 API
  if (process.env.PDD_API_KEY) {
    return callPlatformApi('pdd', keyword);
  }
  // 开发环境: 返回模拟数据
  return mockCrawl('拼多多', keyword);
}

/** 京东采集 */
async function crawlJd(keyword: string): Promise<CrawlResult> {
  if (process.env.JD_API_KEY) {
    return callPlatformApi('jd', keyword);
  }
  return mockCrawl('京东', keyword);
}

/** 淘宝采集 */
async function crawlTaobao(keyword: string): Promise<CrawlResult> {
  if (process.env.TAOBAO_API_KEY) {
    return callPlatformApi('taobao', keyword);
  }
  return mockCrawl('淘宝', keyword);
}

/** 调用平台 API (生产环境) */
async function callPlatformApi(platform: string, keyword: string): Promise<CrawlResult> {
  const endpoints: Record<string, string> = {
    pdd: process.env.PDD_API_URL || '',
    jd: process.env.JD_API_URL || '',
    taobao: process.env.TAOBAO_API_URL || '',
  };

  const apiKeys: Record<string, string> = {
    pdd: process.env.PDD_API_KEY || '',
    jd: process.env.JD_API_KEY || '',
    taobao: process.env.TAOBAO_API_KEY || '',
  };

  const res = await fetch(`${endpoints[platform]}?keyword=${encodeURIComponent(keyword)}`, {
    headers: { Authorization: `Bearer ${apiKeys[platform]}` },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error(`${platform} API 请求失败: ${res.status}`);
  const data = await res.json();

  return {
    platform: data.platform,
    price: data.price,
    prevPrice: data.prevPrice,
    trend: data.trend,
    delta: data.delta,
    url: data.url,
    productName: data.productName,
  };
}

/** 模拟采集 (开发环境) */
function mockCrawl(platform: string, keyword: string): CrawlResult {
  // 基于关键词生成确定性价格 (同一关键词返回相同结果)
  const seed = keyword.length * 17 + platform.length * 31;
  const basePrice = 1000 + (seed % 5000);
  const prevPrice = basePrice + ((seed % 200) - 100);
  const delta = basePrice - prevPrice;
  const trend = delta < 0 ? 'down' : delta > 0 ? 'up' : 'flat';

  return {
    platform,
    price: basePrice,
    prevPrice,
    trend: trend as 'down' | 'up' | 'flat',
    delta,
    url: '#',
    productName: keyword,
  };
}

/** 将采集结果转为 PlatformQuote */
export function crawlToQuote(c: CrawlResult): PlatformQuote {
  return {
    name: c.platform as PlatformQuote['name'],
    price: c.price,
    prevPrice: c.prevPrice,
    trend: c.trend,
    delta: c.delta,
    url: c.url,
  };
}

/** 保存价格快照到数据库 */
export async function saveSnapshots(results: CrawlResult[], productId: string): Promise<void> {
  // 在 P1 阶段的定时巡检中实现
  // 当前仅接口定义
}
