/* 发送手机验证码 */
import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const phone = body?.phone?.trim();

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { code: 400, message: '请输入正确的手机号' },
      { status: 400 },
    );
  }

  const result = await sendVerificationCode(phone);

  if (!result.success) {
    return NextResponse.json(
      { code: 500, message: result.message },
      { status: 500 },
    );
  }

  // 开发模式返回验证码, 生产模式不返回
  return NextResponse.json({
    success: true,
    message: result.message,
    ...(result.code ? { devCode: result.code } : {}),
  });
}
