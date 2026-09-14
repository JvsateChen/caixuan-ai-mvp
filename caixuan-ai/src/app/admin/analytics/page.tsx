/* ============================================================
   采选AI平台 · 企业数据分析页 (P2)
   月度支出趋势 + 供应商支出 + 订单状态 + 年度汇总
   ============================================================ */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Package, DollarSign, Percent } from 'lucide-react';
import { StatCard } from '@/components/ui/PriceTag';
import { SkeletonText, SkeletonCard } from '@/components/Skeleton';
import { api } from '@/lib/api';
import { formatPrice, formatNumber } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  approved: '#059669',
  pending: '#d97706',
  completed: '#4f46e5',
  rejected: '#dc2626',
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['enterprise-analytics'],
    queryFn: () => apiFetch('/api/enterprise/analytics'),
  });

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>
        数据分析
      </h1>

        {/* 年度汇总卡片 */}
        {isLoading ? (
          <div className="grid grid-cols-4 gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="年度订单" value={data?.yearlySummary?.totalOrders ?? 0} icon={<Package size={20} />} />
            <StatCard label="年度支出" value={formatPrice(data?.yearlySummary?.totalSpend ?? 0)} icon={<DollarSign size={20} />} />
            <StatCard label="平均订单" value={formatPrice(data?.yearlySummary?.avgOrder ?? 0)} icon={<TrendingUp size={20} />} />
            <StatCard label="供应商数" value={data?.supplierSpend?.length ?? 0} icon={<Percent size={20} />} />
          </div>
        )}

        {/* 月度趋势 */}
        <section className="card mb-lg">
          <h2 className="section-title">月度支出趋势</h2>
          {isLoading ? (
            <div style={{ height: 300 }}>
              <SkeletonText width="100%" height={300} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.monthlyTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${formatNumber(v)}`} />
                <Tooltip formatter={(v) => formatPrice(Number(v))} />
                <Legend />
                <Line type="monotone" dataKey="spend" stroke="#4f46e5" strokeWidth={2} name="支出" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* 供应商支出 */}
          <section className="card mb-lg">
            <h2 className="section-title">供应商支出排名</h2>
            {isLoading ? (
              <SkeletonText width="100%" height={250} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.supplierSpend ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${formatNumber(v)}`} />
                  <YAxis type="category" dataKey="supplier" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} />
                  <Bar dataKey="spend" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* 订单状态分布 */}
          <section className="card mb-lg">
            <h2 className="section-title">订单状态分布</h2>
            {isLoading ? (
              <SkeletonText width="100%" height={250} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data?.statusDist ?? []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry: any) => `${entry.status}: ${entry.count}`}
                  >
                    {(data?.statusDist ?? []).map((entry: any) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>
    </>
  );
}

// 简化 fetch (避免 api.ts 未定义 analytics 方法)
async function apiFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('请求失败');
  return res.json();
}
