/* ============================================================
   采选AI平台 · API 路由辅助函数
   模拟延迟 + 随机失败 + 深拷贝返回
   ============================================================ */

import { NextResponse } from 'next/server';
import { delay, shouldFail, deepClone } from './utils';

export const MOCK_ERROR_MESSAGE = '网络请求失败，请检查网络后重试';

/**
 * 模拟API响应: 延迟 + 随机失败 + 深拷贝数据
 */
export async function mockApi<T>(
  data: T,
  opts: { minDelay?: number; maxDelay?: number; failRate?: number } = {},
): Promise<NextResponse> {
  const {
    minDelay = 500,
    maxDelay = 1100,
    failRate = 0.12,
  } = opts;

  // 随机延迟
  const ms = minDelay + Math.floor(Math.random() * (maxDelay - minDelay));
  await delay(ms);

  // 随机失败
  if (shouldFail(failRate)) {
    return NextResponse.json(
      { code: 500, message: MOCK_ERROR_MESSAGE },
      { status: 500 },
    );
  }

  return NextResponse.json(deepClone(data));
}
