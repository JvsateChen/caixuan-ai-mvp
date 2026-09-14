/* 供应商 — 更新 */
import { NextRequest, NextResponse } from 'next/server';
import { updateSupplier } from '@/services/enterprise';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getCurrentUser(req as any);
  if (!user || user.role !== 'enterprise_admin') {
    return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const success = updateSupplier(id, body);
  if (!success) {
    return NextResponse.json({ code: 404, message: '供应商不存在' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
