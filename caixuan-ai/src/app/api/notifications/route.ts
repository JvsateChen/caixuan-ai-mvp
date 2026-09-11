/* 用户通知列表 */
import { NextRequest, NextResponse } from 'next/server';
import { getNotifications } from '@/services/notifier';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const onlyUnread = searchParams.get('unread') === 'true';

  const notifications = getNotifications(user.id, onlyUnread);
  return NextResponse.json(notifications);
}
