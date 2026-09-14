/* ============================================================
   采选AI平台 · 企业管理台布局 (P2)
   统一外壳: Topbar + 企业信息条 + 侧边栏导航
   所有 /admin/* 子页面共享此布局
   ============================================================ */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Wallet,
  Users,
  FileCheck,
  BarChart3,
  Package,
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import { Badge } from '@/components/ui/Badge';
import { cx } from '@/lib/utils';

const NAV = [
  { label: '采购概览', href: '/admin', icon: Building2 },
  { label: '供应商管理', href: '/admin/suppliers', icon: Package },
  { label: '审批中心', href: '/admin/approvals', icon: FileCheck },
  { label: '数据分析', href: '/admin/analytics', icon: BarChart3 },
  { label: '预算管理', href: '/admin/budget', icon: Wallet },
  { label: '成员管理', href: '/admin/members', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <Topbar />
      {/* 企业信息条 */}
      <div className="enterprise-bar">
        <div className="ent-left">
          <span className="ent-icon">
            <Building2 size={18} />
          </span>
          <span className="ent-name">采选集团 · 总部</span>
          <Badge variant="brand">企业版</Badge>
        </div>
        <div className="ent-right">
          <span className="ent-admin">
            管理员: <strong>张明</strong>
          </span>
        </div>
      </div>

      <div className="layout-with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">采购管理</div>
          {NAV.map((item) => {
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx('sidebar-item', active && 'active')}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <div className="sidebar-section">系统</div>
          <div className="sidebar-item">通知中心</div>
          <div className="sidebar-item">帮助文档</div>
        </aside>

        {/* 子页面内容 */}
        <main className="sidebar-content">{children}</main>
      </div>
    </div>
  );
}
