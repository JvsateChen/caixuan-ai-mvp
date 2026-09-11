/* ============================================================
   采选AI平台 · 多渠道通知服务
   站内通知 + 微信推送 + 短信推送
   ============================================================ */

import { getDb } from '@/lib/db';

export interface NotificationData {
  type: 'price_alert' | 'system' | 'order';
  title: string;
  message: string;
}

/** 站内通知 — 写入 notifications 表 */
export async function notifyInApp(userId: string, data: NotificationData): Promise<boolean> {
  const db = getDb();
  const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, is_read)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(id, userId, data.type, data.title, data.message);
  return true;
}

/** 微信推送 — 调用微信公众号模板消息 */
export async function notifyWechat(userId: string, message: string): Promise<boolean> {
  if (!process.env.WECHAT_APP_ID || !process.env.WECHAT_APP_SECRET) {
    // 未配置微信, 跳过
    return false;
  }

  const db = getDb();
  const user = db.prepare('SELECT wechat_id FROM users WHERE id = ?').get(userId) as { wechat_id?: string } | undefined;

  if (!user?.wechat_id) {
    return false; // 用户未绑定微信
  }

  try {
    const apiUrl = process.env.WECHAT_API_URL || 'https://api.weixin.qq.com/cgi-bin/message/template/send';
    const tokenRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}`,
    );
    const tokenData = await tokenRes.json();

    await fetch(`${apiUrl}?access_token=${tokenData.access_token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        touser: user.wechat_id,
        template_id: process.env.WECHAT_TEMPLATE_ID,
        data: { message: { value: message } },
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/** 短信推送 — 调用短信服务 */
export async function notifySms(userId: string, message: string): Promise<boolean> {
  if (!process.env.SMS_API_KEY) {
    return false;
  }

  const db = getDb();
  const user = db.prepare('SELECT phone FROM users WHERE id = ?').get(userId) as { phone?: string } | undefined;

  if (!user?.phone) {
    return false;
  }

  try {
    const apiUrl = process.env.SMS_API_URL || '';
    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SMS_API_KEY}`,
      },
      body: JSON.stringify({
        phone: user.phone,
        template: 'caixuan-alert',
        params: { message },
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/** 获取用户通知列表 */
export function getNotifications(userId: string, onlyUnread = false): any[] {
  const db = getDb();
  return onlyUnread
    ? db.prepare('SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC').all(userId)
    : db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

/** 标记通知为已读 */
export function markAsRead(notificationId: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?
  `).run(notificationId, userId);
  return result.changes > 0;
}

/** 标记全部已读 */
export function markAllAsRead(userId: string): boolean {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  return true;
}
