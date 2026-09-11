/* ============================================================
   采选AI平台 · 全局错误边界
   捕获未处理的运行时错误, 显示友好错误页
   ============================================================ */

'use client';

import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 生产环境: 上报到 Sentry
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      console.error('[Error Boundary]', error);
      // Sentry.captureException(error);
    } else {
      console.error('[Error Boundary]', error);
    }
  }, [error]);

  return (
    <div className="app-shell">
      <main className="main-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>页面出错了</h1>
        <p className="text-muted mb-lg">
          {error.message || '发生未知错误, 请稍后重试'}
        </p>
        <div className="flex-center gap-md" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={reset}>
            <RefreshCw size={16} /> 重试
          </button>
          <a href="/" className="btn btn-ghost">
            <Home size={16} /> 返回首页
          </a>
        </div>
      </main>
    </div>
  );
}
