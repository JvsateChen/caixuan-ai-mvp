/* ============================================================
   采选AI平台 · Badge / 平台色点 / Spinner / EmptyState
   通用UI原子组件
   ============================================================ */

import { AlertTriangle } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { cx, platformColor } from '@/lib/utils';
import type { Trend, PlatformName } from '@/lib/types';

type BadgeVariant =
  | 'brand'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'muted';

export function Badge({
  variant = 'brand',
  children,
  className,
  style,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cx('badge', `badge-${variant}`, className)} style={style}>
      {children}
    </span>
  );
}

/** 趋势Badge */
export function TrendBadge({ trend }: { trend: Trend }) {
  const variant: BadgeVariant =
    trend === 'down' ? 'success' : trend === 'up' ? 'danger' : 'warning';
  const text = trend === 'down' ? '降价' : trend === 'up' ? '涨价' : '持平';
  return (
    <Badge variant={variant}>
      {text}
    </Badge>
  );
}

/** 彩虹Badge (目标达成) */
export function RainbowBadge({ children }: { children: ReactNode }) {
  return <span className="rainbow-badge">{children}</span>;
}

/** 平台色点 */
export function PlatformDot({ name }: { name: PlatformName }) {
  return (
    <span
      className="platform-dot"
      style={{ background: platformColor(name) }}
    />
  );
}

/** Spinner */
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      aria-label="加载中"
    />
  );
}

/** 空状态 */
export function EmptyState({
  message = '暂无数据',
  icon,
  action,
}: {
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon ?? <AlertTriangle size={32} />}
      <p>{message}</p>
      {action}
    </div>
  );
}
