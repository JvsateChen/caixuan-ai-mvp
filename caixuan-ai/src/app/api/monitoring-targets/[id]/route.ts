/* 监控目标 — 删除 */
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ code: 401, message: '请先登录' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const result = db.prepare('DELETE FROM monitoring_targets WHERE id = ? AND user_id = ?').run(id, user.id);

  if (result.changes === 0) {
    return NextResponse.json({ code: 404, message: '目标不存在' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
