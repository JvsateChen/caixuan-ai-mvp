/* ============================================================
   采选AI平台 · BackButton / Breadcrumb / SectionHeader
   ============================================================ */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** 返回按钮 */
export function BackButton({ fallback = '/' }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="back-btn"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
    >
      <ArrowLeft size={16} /> 返回
    </button>
  );
}

/** 面包屑 */
export interface Crumb {
  label: string;
  href?: string;
}
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="面包屑">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {item.href && !last ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className="crumb-current">{item.label}</span>
            )}
            {!last && (
              <span className="crumb-sep">
                <ChevronRight size={14} />
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** 区块标题 */
export function SectionHeader({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {action}
    </div>
  );
}
