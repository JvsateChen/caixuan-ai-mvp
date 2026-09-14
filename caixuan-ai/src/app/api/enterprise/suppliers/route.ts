/* 供应商管理 — 查询 + 创建 (含权限检查) */
import { NextRequest, NextResponse } from 'next/server';
import { getSuppliers, createSupplier, compareSuppliers } from '@/services/enterprise';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ code: 401, message: '请先登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const compare = searchParams.get('compare') === 'true';

  if (compare) {
    return NextResponse.json(compareSuppliers());
  }

  return NextResponse.json(getSuppliers(category));
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const guard = requirePermission(user, 'supplier:create');
  if (!guard.allowed) {
    return NextResponse.json({ code: 403, message: guard.error }, { status: 403 });
  }

  const body = await req.json();
  const { name, category, contact, phone, rating } = body;

  if (!name || !category) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }

  const supplier = createSupplier({ name, category, contact, phone, rating });
  return NextResponse.json({ success: true, supplier });
}
