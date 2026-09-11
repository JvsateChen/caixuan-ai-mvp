/* 标记通知为已读 */
import { NextRequest, NextResponse } from 'next/server';
import { markAsRead, markAllAsRead } from '@/services/notifier';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  if (id === 'all') {
    markAllAsRead(user.id);
    return NextResponse.json({ success: true });
  }

  const success = markAsRead(id, user.id);
  if (!success) {
    return NextResponse.json({ code: 404, message: '通知不存在' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
