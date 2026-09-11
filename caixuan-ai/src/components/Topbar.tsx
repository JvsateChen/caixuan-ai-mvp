/* ============================================================
   采选AI平台 · Topbar 顶部导航
   参照 app.js 中 Topbar 渲染逻辑
   ============================================================ */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Bell, User } from 'lucide-react';
import { cx } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'AI比价' },
  { href: '/compare', label: '比价结果' },
  { href: '/dashboard', label: '我的看板' },
  { href: '/admin', label: '企业采购' },
];

export default function Topbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link href="/" className="logo">
          <span className="logo-mark">
            <ShoppingCart size={18} />
          </span>
          <span>采选AI</span>
        </Link>
        <nav className="topbar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx('nav-link', isActive(item.href) && 'active')}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="topbar-right">
        <button type="button" className="icon-btn" aria-label="通知">
          <Bell size={18} />
          <span className="badge-dot" />
        </button>
        <Link href="/profile" className="icon-btn" aria-label="个人中心">
          <User size={18} />
        </Link>
        <Link href="/profile" className="avatar" aria-label="头像">
          选
        </Link>
      </div>
    </header>
  );
}
