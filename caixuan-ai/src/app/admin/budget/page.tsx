/* ============================================================
   采选AI平台 · 预算管理页 (P2)
   年度预算设置 + 执行率监控 + 部门明细
   ============================================================ */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/ui/PriceTag';
import { Badge, Spinner, EmptyState } from '@/components/ui/Badge';
import { SkeletonText, SkeletonCard } from '@/components/Skeleton';
import { useToastStore } from '@/store/toast';
import { formatPrice, formatNumber } from '@/lib/utils';

export default function BudgetPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ year: 2026, department: '', total: 0 });
  const toast = useToastStore();
  const qc = useQueryClient();

  const { data: execution, isLoading } = useQuery({
    queryKey: ['budget-execution'],
    queryFn: async () => {
      const res = await fetch('/api/enterprise/budget?execution=true');
      if (!res.ok) throw new Error('加载失败');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/enterprise/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('创建失败');
      return res.json();
    },
    onSuccess: () => {
      toast.success('保存成功', '预算已设置');
      qc.invalidateQueries({ queryKey: ['budget-execution'] });
      setShowForm(false);
      setFormData({ year: 2026, department: '', total: 0 });
    },
    onError: () => toast.error('保存失败', '请稍后重试'),
  });

  const chartData = (execution?.departments || []).map((d: any) => ({
    department: d.department,
    执行率: d.rate,
  }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>预算管理</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Wallet size={16} /> 设置预算
        </button>
      </div>

        {/* 汇总卡片 */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label={`${execution?.year || ''}年度预算`} value={formatPrice(execution?.totalBudget ?? 0)} icon={<Wallet size={20} />} />
            <StatCard label="已使用" value={formatPrice(execution?.totalSpent ?? 0)} icon={<TrendingUp size={20} />} />
            <StatCard label="剩余" value={formatPrice(execution?.remaining ?? 0)} icon={<Wallet size={20} />} />
            <StatCard
              label="执行率"
              value={`${execution?.executionRate ?? 0}%`}
              icon={<TrendingUp size={20} />}
              changeTrend={(execution?.executionRate ?? 0) > 80 ? 'up' : 'flat'}
            />
          </div>
        )}

        {/* 超支预警 */}
        {execution?.departments?.filter((d: any) => d.rate > 90).map((d: any) => (
          <div key={d.department} className="alert alert-warning mb-lg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> 部门「{d.department}」预算执行率达 {d.rate}%，接近超支
          </div>
        ))}

        {/* 执行率柱状图 */}
        <section className="card mb-lg">
          <h2 className="section-title">部门预算执行率</h2>
          {isLoading ? (
            <SkeletonText width="100%" height={300} />
          ) : chartData.length === 0 ? (
            <EmptyState message="暂无预算数据" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="执行率" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry['执行率'] > 90 ? '#dc2626' : entry['执行率'] > 70 ? '#d97706' : '#059669'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* 预算设置表单 */}
        {showForm && (
          <section className="card mb-lg" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 12 }}>设置部门预算</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <input className="input" type="number" placeholder="年份" value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} />
              <input className="input" placeholder="部门名称" value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              <input className="input" type="number" placeholder="预算金额" value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })} />
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-primary"
                disabled={!formData.department || !formData.total || createMutation.isPending}
                onClick={() => createMutation.mutate(formData)}
              >
                {createMutation.isPending ? <Spinner size={16} /> : '保存'}
              </button>
            </div>
          </section>
        )}

        {/* 部门明细表 */}
        <section className="card">
          <h2 className="section-title">部门预算明细</h2>
          {isLoading ? (
            <SkeletonText width="100%" height={200} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>部门</th>
                    <th>预算</th>
                    <th>已用</th>
                    <th>剩余</th>
                    <th>执行率</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {execution?.departments?.map((d: any) => (
                    <tr key={d.department}>
                      <td className="font-bold">{d.department}</td>
                      <td>{formatPrice(d.total)}</td>
                      <td>{formatPrice(d.spent)}</td>
                      <td>{formatPrice(d.total - d.spent)}</td>
                      <td>
                        <span style={{ color: d.rate > 90 ? '#dc2626' : d.rate > 70 ? '#d97706' : '#059669', fontWeight: 700 }}>
                          {d.rate}%
                        </span>
                      </td>
                      <td>
                        <Badge variant={d.rate > 90 ? 'danger' : d.rate > 70 ? 'warning' : 'success'}>
                          {d.rate > 90 ? '超支风险' : d.rate > 70 ? '偏高' : '正常'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
    </>
  );
}
