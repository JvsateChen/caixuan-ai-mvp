/* ============================================================
   采选AI平台 · 我的看板 (P1)
   监控目标表 / 价格快照表 / 采购记录表 / 周报复盘
   参照 dashboard.html - Tab切换多表格
   ============================================================ */

'use client';

import { useState } from 'react';
import {
  Target,
  Camera,
  ShoppingBag,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
  Trophy,
  Sparkles,
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import { QueryState } from '@/components/QueryState';
import {
  SkeletonTable,
  SkeletonStatCards,
  SkeletonCard,
} from '@/components/Skeleton';
import { Badge, EmptyState, PlatformDot, TrendBadge } from '@/components/ui/Badge';
import { StatCard, PriceTag } from '@/components/ui/PriceTag';
import { SectionHeader } from '@/components/ui/Buttons';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toast';
import type {
  MonitoringTarget,
  PriceSnapshot,
  PurchaseRecord,
  WeeklyReview,
} from '@/lib/types';
import { cx, formatPrice, formatNumber } from '@/lib/utils';

type Tab = 'targets' | 'snapshots' | 'orders' | 'review';

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'targets', label: '监控目标', icon: Target },
  { key: 'snapshots', label: '价格快照', icon: Camera },
  { key: 'orders', label: '采购记录', icon: ShoppingBag },
  { key: 'review', label: '周报复盘', icon: FileText },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('targets');

  return (
    <div className="app-shell">
      <Topbar />
      <main className="main-content">
        <h1 className="page-title">我的看板</h1>
        <p className="page-subtitle">
          监控目标 · 价格快照 · 采购记录 · 周报复盘 · 一站式管理采购数据
        </p>

        {/* 周报关键指标 */}
        <QueryState
          queryKey={['weekly-review']}
          queryFn={api.getWeeklyReview}
          skeleton={<SkeletonStatCards count={4} />}
        >
          {(review: WeeklyReview) => (
            <div className="grid grid-4 mb-lg">
              <StatCard
                icon={<Wallet size={20} className="text-success" />}
                value={formatPrice(review.totalSavings)}
                label="本周节省"
                change={`环比 ${review.savingsChange > 0 ? '+' : ''}${review.savingsChange}%`}
                changeTrend={review.trend}
              />
              <StatCard
                icon={<Target size={20} className="text-brand-1" />}
                value={`${review.itemsCompared}`}
                label="比价商品"
                unit="件"
              />
              <StatCard
                icon={<ShoppingBag size={20} className="text-info" />}
                value={`${review.ordersPlaced}`}
                label="下单数"
                unit="单"
              />
              <StatCard
                icon={<Trophy size={20} className="text-warning" />}
                value={formatPrice(review.commissionEarned)}
                label="佣金收益"
              />
            </div>
          )}
        </QueryState>

        {/* Tabs */}
        <div className="tabs mb-md">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={cx('tab', tab === t.key && 'active')}
              onClick={() => setTab(t.key)}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'targets' && <TargetsTab />}
        {tab === 'snapshots' && <SnapshotsTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'review' && <ReviewTab />}
      </main>
    </div>
  );
}

/** 监控目标表 */
function TargetsTab() {
  return (
    <QueryState
      queryKey={['monitoring-targets']}
      queryFn={api.getMonitoringTargets}
      skeleton={<SkeletonTable rows={6} cols={6} />}
    >
      {(targets: MonitoringTarget[]) => {
        if (targets.length === 0)
          return <EmptyState message="暂无监控目标" icon={<Target size={32} />} />;
        return (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>商品</th>
                  <th>目标价</th>
                  <th>当前价</th>
                  <th>平台</th>
                  <th>状态</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => (
                  <tr
                    key={t.id}
                    className={cx(t.status === 'achieved' && 'rainbow-sweep')}
                    style={{ cursor: 'pointer' }}
                    onClick={() => (window.location.href = `/detail?id=${encodeURIComponent(t.productId)}`)}
                  >
                    <td className="truncate" style={{ maxWidth: 220 }}>{t.productName}</td>
                    <td className="font-mono">{formatPrice(t.targetPrice)}</td>
                    <td>
                      <span className={cx('price', 'price-sm', t.trend === 'down' ? 'price-down' : t.trend === 'up' ? 'price-up' : 'price-flat')}>
                        {formatPrice(t.currentPrice)}
                      </span>
                    </td>
                    <td>
                      <PlatformDot name={t.platform} /> {t.platform}
                    </td>
                    <td>
                      {t.status === 'achieved' ? (
                        <Badge variant="success">
                          <Sparkles size={12} /> 已达成
                        </Badge>
                      ) : (
                        <Badge variant="warning">监控中</Badge>
                      )}
                    </td>
                    <td className="text-muted text-sm">{t.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }}
    </QueryState>
  );
}

/** 价格快照表 */
function SnapshotsTab() {
  return (
    <QueryState
      queryKey={['price-snapshots']}
      queryFn={api.getPriceSnapshots}
      skeleton={<SkeletonTable rows={8} cols={6} />}
    >
      {(snaps: PriceSnapshot[]) => {
        if (snaps.length === 0)
          return <EmptyState message="暂无价格快照" icon={<Camera size={32} />} />;
        return (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>商品</th>
                  <th>平台</th>
                  <th>当前价</th>
                  <th>上一次</th>
                  <th>变动</th>
                  <th>快照时间</th>
                </tr>
              </thead>
              <tbody>
                {snaps.map((s) => (
                  <tr key={s.id}>
                    <td className="truncate" style={{ maxWidth: 200 }}>{s.productName}</td>
                    <td><PlatformDot name={s.platform} /> {s.platform}</td>
                    <td className="font-mono">{formatPrice(s.price)}</td>
                    <td className="text-muted font-mono">{formatPrice(s.prevPrice)}</td>
                    <td>
                      <span className={cx('price-trend', s.trend === 'down' ? 'price-down' : s.trend === 'up' ? 'price-up' : 'price-flat')}>
                        {s.change > 0 ? '+' : ''}{formatPrice(Math.abs(s.change))}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{s.snapshotAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }}
    </QueryState>
  );
}

/** 采购记录表 */
function OrdersTab() {
  return (
    <QueryState
      queryKey={['purchase-records']}
      queryFn={api.getPurchaseRecords}
      skeleton={<SkeletonTable rows={5} cols={7} />}
    >
      {(records: PurchaseRecord[]) => {
        if (records.length === 0)
          return <EmptyState message="暂无采购记录" icon={<ShoppingBag size={32} />} />;
        const totalSpend = records.reduce((s, r) => s + r.total, 0);
        const totalCommission = records.reduce((s, r) => s + r.commission, 0);
        return (
          <>
            <div className="flex gap-md mb-md" style={{ gap: 16, alignItems: 'center' }}>
              <Badge variant="brand">采购 {records.length} 单</Badge>
              <Badge variant="success">总支出 {formatPrice(totalSpend)}</Badge>
              <Badge variant="warning">佣金收益 {formatPrice(totalCommission)}</Badge>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>商品</th>
                    <th>平台</th>
                    <th>单价</th>
                    <th>数量</th>
                    <th>总额</th>
                    <th>佣金</th>
                    <th>状态</th>
                    <th>下单日期</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-sm">{r.id}</td>
                      <td className="truncate" style={{ maxWidth: 180 }}>{r.productName}</td>
                      <td><PlatformDot name={r.platform} /> {r.platform}</td>
                      <td className="font-mono">{formatPrice(r.price)}</td>
                      <td>{r.qty}</td>
                      <td className="font-mono font-bold">{formatPrice(r.total)}</td>
                      <td className="font-mono text-muted">{formatPrice(r.commission)}</td>
                      <td>
                        {r.status === 'completed' ? (
                          <Badge variant="success">已完成</Badge>
                        ) : (
                          <Badge variant="warning">待发货</Badge>
                        )}
                      </td>
                      <td className="text-muted text-sm">{r.orderDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      }}
    </QueryState>
  );
}

/** 周报复盘 */
function ReviewTab() {
  return (
    <QueryState
      queryKey={['weekly-review']}
      queryFn={api.getWeeklyReview}
      skeleton={
        <>
          <SkeletonCard />
          <div style={{ marginTop: 16 }}>
            <SkeletonCard />
          </div>
        </>
      }
    >
      {(review: WeeklyReview) => (
        <div>
          <section className="card mb-lg">
            <SectionHeader
              title={`周报复盘 · ${review.weekRange}`}
              action={
                <Badge variant={review.trend === 'up' ? 'success' : 'warning'}>
                  {review.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  节省环比 {review.savingsChange > 0 ? '+' : ''}{review.savingsChange}%
                </Badge>
              }
            />
            <div className="grid grid-4">
              <div className="mini-stat">
                <span className="mini-val price-down">{formatPrice(review.totalSavings)}</span>
                <span className="mini-label">本周总节省</span>
              </div>
              <div className="mini-stat">
                <span className="mini-val">{review.itemsCompared}</span>
                <span className="mini-label">比价商品数</span>
              </div>
              <div className="mini-stat">
                <span className="mini-val">{review.ordersPlaced}</span>
                <span className="mini-label">下单数</span>
              </div>
              <div className="mini-stat">
                <span className="mini-val text-warning">{formatPrice(review.commissionEarned)}</span>
                <span className="mini-label">佣金收益</span>
              </div>
            </div>
          </section>

          <section className="card">
            <SectionHeader title="本周最佳交易" />
            <div className="grid grid-3">
              {review.bestDeals.map((d, i) => (
                <div key={i} className="deal-card">
                  <div className="flex items-center gap-sm" style={{ gap: 6, alignItems: 'center' }}>
                    <Badge variant="success">
                      <Trophy size={12} /> 省 {formatPrice(d.saved)}
                    </Badge>
                  </div>
                  <div className="truncate font-bold mt-sm" style={{ marginTop: 8, fontSize: '0.88rem' }}>
                    {d.name}
                  </div>
                  <div className="flex items-center gap-sm mt-sm" style={{ gap: 6, alignItems: 'center', marginTop: 8 }}>
                    <PlatformDot name={d.platform} />
                    <span className="text-xs text-muted">{d.platform}</span>
                  </div>
                  <div className="flex items-center gap-sm mt-sm" style={{ gap: 8, alignItems: 'center', marginTop: 12 }}>
                    <span className="deal-original">{formatPrice(d.originalPrice)}</span>
                    <span className="price price-sm price-down">{formatPrice(d.finalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </QueryState>
  );
}
