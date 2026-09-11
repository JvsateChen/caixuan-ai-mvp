/* 404 页面 */
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="app-shell">
      <main className="main-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>404</h1>
        <p className="text-muted mb-lg">您访问的页面不存在</p>
        <div className="flex-center gap-md" style={{ justifyContent: 'center' }}>
          <a href="/" className="btn btn-primary">
            <Home size={16} /> 返回首页
          </a>
          <a href="/compare" className="btn btn-ghost">
            <Search size={16} /> 去比价
          </a>
        </div>
      </main>
    </div>
  );
}
