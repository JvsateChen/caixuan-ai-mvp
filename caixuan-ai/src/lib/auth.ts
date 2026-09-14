/* ============================================================
   采选AI平台 · 认证服务 (JWT + 手机验证码)
   轻量方案: 自管理 JWT, 不依赖 NextAuth 的复杂配置
   ============================================================ */

import jwt from 'jsonwebtoken';
import { getDb } from './db';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'caixuan-ai-dev-secret-2026';
const JWT_EXPIRES = '7d';
const CODE_EXPIRES_MS = 5 * 60 * 1000; // 5 分钟

export interface AuthUser {
  id: string;
  phone: string;
  nickname: string;
  role: string;
  enterpriseId?: string;
}

/** 生成 JWT */
export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/** 验证 JWT */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

/** 生成6位验证码 */
export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** 发送验证码 (开发环境: 返回码到响应, 生产环境: 调用短信 API) */
export async function sendVerificationCode(phone: string): Promise<{ success: boolean; code?: string; message: string }> {
  const code = generateCode();
  const db = getDb();
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_MS).toISOString();

  // 清除旧验证码, 插入新验证码
  db.prepare('DELETE FROM verification_codes WHERE phone = ?').run(phone);
  db.prepare(`
    INSERT INTO verification_codes (phone, code, expires_at)
    VALUES (?, ?, ?)
  `).run(phone, code, expiresAt);

  // 生产环境调用短信服务
  if (process.env.NODE_ENV === 'production' && process.env.SMS_API_KEY) {
    try {
      await callSmsApi(phone, code);
      return { success: true, message: '验证码已发送' };
    } catch {
      return { success: false, message: '短信发送失败, 请稍后重试' };
    }
  }

  // 开发环境: 直接返回验证码
  return { success: true, code, message: '验证码已发送 (开发模式)' };
}

/** 验证验证码 */
export function verifyCode(phone: string, code: string): boolean {
  const db = getDb();
  const row = db.prepare(`
    SELECT code, expires_at FROM verification_codes
    WHERE phone = ? ORDER BY id DESC LIMIT 1
  `).get(phone) as { code: string; expires_at: string } | undefined;

  if (!row) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;
  if (row.code !== code) return false;

  // 验证成功后清除
  db.prepare('DELETE FROM verification_codes WHERE phone = ?').run(phone);
  return true;
}

/** 登录或注册 (手机号) */
export function loginOrRegister(phone: string): AuthUser {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any;

  if (existing) {
    return {
      id: existing.id,
      phone: existing.phone,
      nickname: existing.nickname || `用户${phone.slice(-4)}`,
      role: existing.role,
    };
  }

  // 新用户注册
  const id = `user-${Date.now()}`;
  const nickname = `用户${phone.slice(-4)}`;
  db.prepare(`
    INSERT INTO users (id, phone, nickname, role)
    VALUES (?, ?, ?, 'user')
  `).run(id, phone, nickname);

  return { id, phone, nickname, role: 'user' };
}

/** 从请求头获取当前用户 */
export function getCurrentUser(req: Request): AuthUser | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}

/** 调用短信 API (生产环境) */
async function callSmsApi(phone: string, code: string): Promise<void> {
  const apiUrl = process.env.SMS_API_URL || '';
  const apiKey = process.env.SMS_API_KEY || '';

  await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      phone,
      template: 'caixuan-verify',
      params: { code },
    }),
  });
}
