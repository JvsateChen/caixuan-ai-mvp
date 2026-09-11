/* ============================================================
   采选AI平台 · PriceTag / Sparkline / StatCard
   ============================================================ */

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Trend } from '@/lib/types';
import { cx, formatPrice, trendText } from '@/lib/utils';
import { TrendBadge } from './Badge';

type PriceSize = 'lg' | 'md' | 'sm';

/** 价格标签 */
export function PriceTag({
  value,
  size = 'md',
  trend,
  showTrend = true,
  className,
}: {
  value: number;
  size?: PriceSize;
  trend?: Trend;
  showTrend?: boolean;
  className?: string;
}) {
  const sizeClass = `price-${size}`;
  const trendClass = trend
    ? trend === 'down'
      ? 'price-down'
      : trend === 'up'
        ? 'price-up'
        : 'price-flat'
    : '';
  return (
    <span className={cx('price', sizeClass, trendClass, className)}>
      {formatPrice(value)}
      {showTrend && trend && (
        <TrendIcon trend={trend} />
      )}
    </span>
  );
}

/** 趋势图标 */
export function TrendIcon({ trend, size = 14 }: { trend: Trend; size?: number }) {
  const Icon = trend === 'down' ? ArrowDown : trend === 'up' ? ArrowUp : Minus;
  const cls =
    trend === 'down' ? 'price-down' : trend === 'up' ? 'price-up' : 'price-flat';
  return (
    <span className={cx('price-trend', cls)} style={{ marginLeft: 6 }}>
      <Icon size={size} /> {trendText(trend)}
    </span>
  );
}

/** 价格变化行(对比上一价) */
export function PriceDelta({
  delta,
  trend,
}: {
  delta: number;
  trend: Trend;
}) {
  const sign = delta > 0 ? '+' : '';
  const cls =
    trend === 'down' ? 'price-down' : trend === 'up' ? 'price-up' : 'price-flat';
  return (
    <span className={cx('price-trend', cls)}>
      {sign}
      {formatPrice(Math.abs(delta))}
    </span>
  );
}

/** 迷你Sparkline (内联SVG) */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#4f46e5',
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polygon points={areaPoints} fill={color} opacity={0.1} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 统计卡 */
export function StatCard({
  icon,
  value,
  label,
  change,
  changeTrend,
  unit,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  change?: string;
  changeTrend?: Trend;
  unit?: string;
}) {
  const changeClass = changeTrend
    ? changeTrend === 'down'
      ? 'price-down'
      : changeTrend === 'up'
        ? 'price-up'
        : 'price-flat'
    : '';
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={cx('stat-change', changeClass)}>{change}</div>
      )}
    </div>
  );
}

/** 价格趋势对比表使用 */
export { TrendBadge };
