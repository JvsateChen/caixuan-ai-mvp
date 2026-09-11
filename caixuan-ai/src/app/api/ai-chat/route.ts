/* AI 对话比价 — 切换为真实 DB + LLM 服务 */
import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/services/llm';
import { mockApi } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') ?? '').trim();

  if (!query) {
    return NextResponse.json(
      { code: 400, message: '请输入搜索词' },
      { status: 400 },
    );
  }

  try {
    const result = await aiChat(query);
    // AI对话延迟 (800-1300ms), 失败率 8%
    return mockApi(result, { minDelay: 800, maxDelay: 1300, failRate: 0.08 });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: 'AI对话服务异常' },
      { status: 500 },
    );
  }
}
