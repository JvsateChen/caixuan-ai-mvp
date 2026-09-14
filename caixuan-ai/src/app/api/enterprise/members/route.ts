/* 企业成员管理 — 查询 + 角色分配 */
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const guard = requirePermission(user, 'enterprise:manage');
  if (!guard.allowed) {
    return NextResponse.json({ code: 403, message: guard.error }, { status: 403 });
  }

  const db = getDb();
  const members = db.prepare(`
    SELECT id, phone, nickname, role, enterprise_id, created_at
    FROM users WHERE enterprise_id = ? OR role != 'user'
    ORDER BY created_at
  `).all(user!.enterpriseId || '');

  return NextResponse.json(members);
}

/** 更新成员角色 */
export async function PATCH(req: NextRequest) {
  const user = getCurrentUser(req as any);
  const guard = requirePermission(user, 'enterprise:manage');
  if (!guard.allowed) {
    return NextResponse.json({ code: 403, message: guard.error }, { status: 403 });
  }

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !['enterprise_admin', 'finance', 'buyer', 'user'].includes(role)) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }

  const db = getDb();
  db.prepare('UPDATE users SET role = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(role, userId);

  return NextResponse.json({ success: true });
}
