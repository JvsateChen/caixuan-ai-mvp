/* ============================================================
   采选AI平台 · 路由守卫
   保护需要登录的页面: /dashboard, /profile, /admin
   /login, /, /compare, /detail 公开可访问
   ============================================================ */

import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/profile', '/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 检查是否是受保护路由
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // 检查 JWT (从 cookie 或 Authorization header)
  const token =
    req.cookies.get('caixuan-token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/admin/:path*'],
};
