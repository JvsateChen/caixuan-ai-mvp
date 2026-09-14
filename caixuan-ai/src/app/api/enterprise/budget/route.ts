/* 预算管理 — 查询 + 创建/更新 (含权限检查) */
import { NextRequest, NextResponse } from 'next/server';
import { getBudgets, upsertBudget, getBudgetExecution } from '@/services/enterprise';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const guard = requirePermission(user, 'budget:view');
  if (!guard.allowed) {
    return NextResponse.json({ code: 403, message: guard.error }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
  const execution = searchParams.get('execution') === 'true';

  if (execution) {
    return NextResponse.json(getBudgetExecution(year));
  }

  return NextResponse.json(getBudgets(year));
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const guard = requirePermission(user, 'budget:set');
  if (!guard.allowed) {
    return NextResponse.json({ code: 403, message: guard.error }, { status: 403 });
  }

  const body = await req.json();
  const { year, department, total } = body;

  if (!year || !department || !total) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }

  const budget = upsertBudget({ year, department, total });
  return NextResponse.json({ success: true, budget });
}
