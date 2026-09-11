/* ============================================================
   采选AI平台 · 骨架屏组件
   参照 app.js 中 Utils.skeleton* 工具
   ============================================================ */

import type { CSSProperties } from 'react';
import { cx } from '@/lib/utils';

/** 文本骨架 */
export function SkeletonText({
  width = '60%',
  height = 14,
  className,
  style,
}: {
  width?: string | number;
  height?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const w = typeof width === 'number' ? `${width}px` : width;
  return (
    <div
      className={cx('skeleton skeleton-text', className)}
      style={{ width: w, height, ...style }}
    />
  );
}

/** 标题骨架 */
export function SkeletonTitle({ width = '50%' }: { width?: string }) {
  return (
    <div className="skeleton skeleton-title" style={{ width }} />
  );
}

/** 卡片骨架 */
export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton skeleton-block" />
      <div className="skeleton skeleton-text w-60" />
      <div className="skeleton skeleton-text w-40" />
    </div>
  );
}

/** 圆形骨架 */
export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return (
    <div
      className="skeleton skeleton-circle"
      style={{ width: size, height: size }}
    />
  );
}

/** 行骨架 */
export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <SkeletonCircle size={40} />
      <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonText width="80%" />
        <SkeletonText width="40%" />
      </div>
    </div>
  );
}

/** 多行骨架 */
export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}

/** 统计卡骨架 */
export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className={cx('grid', `grid-${Math.min(count, 4)}`)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="stat-card">
          <SkeletonCircle size={40} />
          <div className="skeleton skeleton-text w-30" style={{ height: 28 }} />
          <SkeletonText width="60%" />
        </div>
      ))}
    </div>
  );
}

/** 比价卡片骨架 (3列) */
export function SkeletonCompareCards() {
  return (
    <div className="compare-grid">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="compare-card">
          <SkeletonText width="40%" style={{ margin: '0 auto 12px' }} />
          <SkeletonText
            width="60%"
            height={28}
            className="skeleton"
          />
          <SkeletonText width="30%" style={{ margin: '8px auto' }} />
          <div
            className="skeleton"
            style={{ height: 32, width: 80, margin: '12px auto 0', borderRadius: 6 }}
          />
        </div>
      ))}
    </div>
  );
}

/** 表格骨架 */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i}>
                <div className="skeleton" style={{ height: 14, width: 60 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  <div className="skeleton" style={{ height: 14, width: '80%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
