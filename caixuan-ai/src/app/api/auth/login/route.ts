/* 手机验证码登录 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, loginOrRegister, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, code } = body;

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { code: 400, message: '请输入正确的手机号' },
      { status: 400 },
    );
  }

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { code: 400, message: '请输入6位验证码' },
      { status: 400 },
    );
  }

  // 验证验证码
  const valid = verifyCode(phone, code);
  if (!valid) {
    return NextResponse.json(
      { code: 401, message: '验证码错误或已过期' },
      { status: 401 },
    );
  }

  // 登录或注册
  const user = loginOrRegister(phone);
  const token = signToken(user);

  return NextResponse.json({
    success: true,
    token,
    user: {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      role: user.role,
    },
  });
}
