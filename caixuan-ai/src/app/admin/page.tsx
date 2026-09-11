/* ============================================================
   采选AI平台 · 企业采购管理台 (P2)
   采购概览 + 支出分类柱状图 + 趋势折线图 + 供应商对比 + 订单表
   参照 admin.html - 侧边栏 + 图表 + 表格
   ============================================================ */

'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Building2,
  Wallet,
  TrendingDown,
  Layers,
  Star,
  ShoppingBag,
  Clock,
  Package,
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import { QueryState } from '@/components/QueryState';
import { SkeletonTable, SkeletonStatCards } from '@/components/Skeleton';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/PriceTag';
import { SectionHeader } from '@/components/ui/Buttons';
import { api } from '@/lib/api';
import type { EnterpriseOrder, EnterpriseStats } from '@/lib/types';
import { formatPrice, formatWan, cx } from '@/lib/utils';

const BAR_COLORS = ['#4f46e5', '#6366f1', '#0ea5e9', '#06b6d4'];

const SIDEBAR = [
  { label: '采购概览', active: true },
  { label: '订单管理' },
  { label: '供应商管理' },
  { label: '审批中心' },
  { label: '数据分析' },
  { label: '预算管理' },
  { label: '系统设置' },
];

export default function AdminPage() {
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
          <span>本月采购: <strong>¥26.8万</strong></span>
          <span className="ent-divider" />
          <span>订单: <strong>12</strong></span>
          <span className="ent-divider" />
          <span>供应商: <strong>3</strong></span>
          <span className="ent-divider" />
          <span className="ent-admin">
            管理员: <strong>张明</strong>
          </span>
        </div>
      </div>

      <div className="layout-with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">采购管理</div>
          {SIDEBAR.map((item) => (
            <div
              key={item.label}
              className={cx('sidebar-item', item.active && 'active')}
            >
              {item.label}
            </div>
          ))}
          <div className="sidebar-section">系统</div>
          <div className="sidebar-item">通知中心</div>
          <div className="sidebar-item">帮助文档</div>
        </aside>

        {/* Main */}
        <main className="sidebar-content">
          <h1 className="page-title">企业采购概览</h1>
          <p className="page-subtitle">
            统一管理企业采购订单、供应商对比、支出分析与预算控制
          </p>

          {/* 概览统计卡 */}
          <QueryState
            queryKey={['enterprise-stats']}
            queryFn={api.getEnterpriseStats}
            skeleton={<SkeletonStatCards count={4} />}
          >
            {(stats: EnterpriseStats) => (
              <>
                <div className="grid grid-4 mb-lg">
                  <StatCard
                    icon={<Wallet size={20} className="text-brand-1" />}
                    value={formatWan(stats.monthlySpend)}
                    label="本月采购总额"
                    change={`同比 +${stats.avgDiscount}% 折扣`}
                    changeTrend="down"
                  />
                  <StatCard
                    icon={<ShoppingBag size={20} className="text-info" />}
                    value={`${stats.monthlyOrders}`}
                    label="本月订单数"
                    unit="单"
                  />
                  <StatCard
                    icon={<TrendingDown size={20} className="text-success" />}
                    value={`${stats.avgDiscount}%`}
                    label="平均折扣"
                  />
                  <StatCard
                    icon={<Layers size={20} className="text-warning" />}
                    value={`${stats.suppliers}`}
                    label="合作供应商"
                    unit="家"
                  />
                </div>

                {/* 图表区 */}
                <div className="grid grid-2 mb-lg">
                  {/* 支出分类柱状图 */}
                  <section className="card">
                    <SectionHeader title="支出分类" />
                    <div className="chart-container" style={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.spendByCategory}
                          margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                        >
                          <CartesianGrid strokeDasharray="2 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                            formatter={(v) => formatPrice(Number(v))}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {stats.spendByCategory.map((_, i) => (
                              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="trend-footer">
                      {stats.spendByCategory.map((c, i) => (
                        <div key={c.name} className="mini-stat">
                          <span
                            className="mini-val"
                            style={{ color: BAR_COLORS[i % BAR_COLORS.length], fontSize: '1rem' }}
                          >
                            {c.pct}%
                          </span>
                          <span className="mini-label">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 趋势折线图 (基于供应商数据合成) */}
                  <section className="card trend-chart">
                    <SectionHeader title="月度采购趋势" />
                    <TrendLineChart stats={stats} />
                    <div className="trend-footer">
                      <div className="mini-stat">
                        <span className="mini-val">{formatWan(stats.monthlySpend)}</span>
                        <span className="mini-label">本月总额</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-val">{stats.monthlyOrders}</span>
                        <span className="mini-label">订单数</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-val">{stats.avgDiscount}%</span>
                        <span className="mini-label">折扣率</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* 供应商对比 */}
                <section className="card mb-lg">
                  <SectionHeader title="供应商对比" />
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>供应商</th>
                          <th>订单数</th>
                          <th>采购总额</th>
                          <th>平均时效</th>
                          <th>评分</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.supplierCompare.map((s) => (
                          <tr key={s.name}>
                            <td className="font-bold">{s.name}</td>
                            <td>{s.orders}</td>
                            <td className="font-mono">{formatPrice(s.total)}</td>
                            <td>
                              <span className="flex items-center gap-sm" style={{ gap: 4, alignItems: 'center' }}>
                                <Clock size={12} className="text-muted" />
                                {s.avgTime} 天
                              </span>
                            </td>
                            <td>
                              <span className="star-row">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={i < Math.floor(s.rating) ? 'text-warning' : 'text-muted'}
                                    fill={i < Math.floor(s.rating) ? 'currentColor' : 'none'}
                                  />
                                ))}
                                <span className="star-text">{s.rating}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </QueryState>

          {/* 订单表 */}
          <section className="card">
            <SectionHeader title="企业采购订单" />
            <QueryState
              queryKey={['enterprise-orders']}
              queryFn={api.getEnterpriseOrders}
              skeleton={<SkeletonTable rows={5} cols={6} />}
            >
              {(orders: EnterpriseOrder[]) => {
                if (orders.length === 0)
                  return <EmptyState message="暂无订单" icon={<Package size={32} />} />;
                return (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>订单号</th>
                          <th>采购标题</th>
                          <th>供应商</th>
                          <th>商品数</th>
                          <th>金额</th>
                          <th>采购人</th>
                          <th>状态</th>
                          <th>日期</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td className="font-mono text-sm">{o.id}</td>
                            <td className="truncate" style={{ maxWidth: 200 }}>{o.title}</td>
                            <td>{o.supplier}</td>
                            <td>{o.items}</td>
                            <td className="font-mono font-bold">{formatPrice(o.total)}</td>
                            <td>{o.buyer}</td>
                            <td>
                              {o.status === 'completed' ? (
                                <Badge variant="success">已完成</Badge>
                              ) : o.status === 'approved' ? (
                                <Badge variant="brand">已审批</Badge>
                              ) : (
                                <Badge variant="warning">待审批</Badge>
                              )}
                            </td>
                            <td className="text-muted text-sm">{o.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }}
            </QueryState>
          </section>
        </main>
      </div>
    </div>
  );
}

/** 趋势折线图 (基于供应商数据合成12周数据) */
function TrendLineChart({ stats }: { stats: EnterpriseStats }) {
  // 基于月度总额生成12周模拟趋势
  const data = Array.from({ length: 12 }, (_, i) => {
    const base = stats.monthlySpend / 4; // 周均
    const factor = 0.7 + (i / 12) * 0.6; // 递增趋势
    const noise = 0.85 + (Math.sin(i) + 1) * 0.075;
    return {
      week: `W${i + 1}`,
      spend: Math.round(base * factor * noise),
    };
  });

  return (
    <div className="chart-container" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="2 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => formatPrice(Number(v))}
          />
          <Line
            type="monotone"
            dataKey="spend"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3, fill: '#4f46e5' }}
            activeDot={{ r: 5 }}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
