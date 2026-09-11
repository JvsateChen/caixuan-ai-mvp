/* ============================================================
   采选AI平台 · LLM 对话服务
   解析用户自然语言 → 提取品牌/品类/关键词 → 商品匹配
   开发环境: 关键词匹配降级
   生产环境: 调用 LLM API (豆包/通义千问/OpenAI)
   ============================================================ */

import { searchProducts, getProducts } from '@/lib/db/queries';
import type { Product, AiChatResponse } from '@/lib/types';

/** 用户意图解析结果 */
interface ParsedIntent {
  brand: string;
  category: string;
  keywords: string[];
}

/** 解析用户输入 → 商品匹配 */
export async function aiChat(query: string): Promise<AiChatResponse> {
  // 尝试 LLM 解析 (如果配置了 API Key)
  let parsed: ParsedIntent;

  if (process.env.LLM_API_KEY) {
    try {
      parsed = await parseWithLLM(query);
    } catch {
      // LLM 超时/失败 → 降级为关键词匹配
      parsed = parseWithKeyword(query);
    }
  } else {
    // 开发环境: 关键词匹配
    parsed = parseWithKeyword(query);
  }

  // 搜索商品
  let results: Product[] = [];
  for (const kw of parsed.keywords) {
    const found = searchProducts(kw);
    if (found.length > 0) {
      results = found;
      break;
    }
  }

  // 如果没有匹配, 返回前3个商品
  if (results.length === 0) {
    results = getProducts().slice(0, 3);
  }

  return {
    query,
    parsed: {
      brand: parsed.brand,
      model: '',
      category: parsed.category,
    },
    results,
    total: results.length,
  };
}

/** 调用 LLM 解析意图 (生产环境) */
async function parseWithLLM(query: string): Promise<ParsedIntent> {
  const apiUrl = process.env.LLM_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  const apiKey = process.env.LLM_API_KEY!;
  const model = process.env.LLM_MODEL || 'doubao-pro-4k';

  const prompt = `你是一个商品比价助手。用户会输入商品需求，你需要解析出：
- brand: 品牌名（如 Apple, 兰蔻, Sony, Dyson, 小米, SK-II）
- category: 商品类目（3C数码/美妆护肤/日用百货，不确定则留空）
- keywords: 搜索关键词数组（用于数据库搜索的商品名片段）

用户输入: "${query}"
请返回 JSON: {"brand":"","category":"","keywords":[""]}`;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(3000), // 3秒超时
  });

  if (!res.ok) throw new Error(`LLM API 请求失败: ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

/** 关键词匹配降级方案 (开发环境) */
function parseWithKeyword(query: string): ParsedIntent {
  const lower = query.toLowerCase();

  // 品牌映射
  const brandMap: Record<string, string> = {
    apple: 'Apple',
    iphone: 'Apple',
    兰蔻: '兰蔻',
    lancome: '兰蔻',
    sony: 'Sony',
    戴森: 'Dyson',
    dyson: 'Dyson',
    小米: '小米',
    xiaomi: '小米',
    'sk-ii': 'SK-II',
    'skii': 'SK-II',
  };

  // 品类映射
  const categoryMap: Record<string, string> = {
    手机: '3C数码',
    耳机: '3C数码',
    电脑: '3C数码',
    精华: '美妆护肤',
    护肤: '美妆护肤',
    化妆: '美妆护肤',
    吸尘器: '日用百货',
    家电: '日用百货',
  };

  let brand = '';
  let category = '';

  for (const [key, val] of Object.entries(brandMap)) {
    if (lower.includes(key)) {
      brand = val;
      break;
    }
  }

  for (const [key, val] of Object.entries(categoryMap)) {
    if (query.includes(key)) {
      category = val;
      break;
    }
  }

  // 生成搜索关键词 (原文 + 品牌名)
  const keywords = [query];
  if (brand) keywords.push(brand);
  // 去除常见后缀
  keywords.push(query.replace(/比价|价格|多少钱|便宜/g, '').trim());

  return { brand, category, keywords };
}
