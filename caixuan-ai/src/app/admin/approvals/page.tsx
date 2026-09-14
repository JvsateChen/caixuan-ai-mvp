/* ============================================================
   采选AI平台 · 审批中心 (P2)
   待审批订单列表 + 批量审批
   ============================================================ */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Badge, EmptyState, Spinner } from '@/components/ui/Badge';
import { SkeletonRows } from '@/components/Skeleton';
import { useToastStore } from '@/store/toast';
import { formatPrice, formatNumber } from '@/lib/utils';

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const toast = useToastStore();
  const qc = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['enterprise-orders', filter],
    queryFn: async () => {
      const res = await fetch('/api/enterprise-orders');
      if (!res.ok) throw new Error('加载失败');
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      const res = await fetch(`/api/enterprise-orders/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('操作失败');
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.action === 'approve' ? '审批通过' : '已拒绝',
        `订单状态: ${data.status}`,
      );
      qc.invalidateQueries({ queryKey: ['enterprise-orders'] });
    },
    onError: () => toast.error('操作失败', '请稍后重试'),
  });

  const filteredOrders = filter === 'pending'
    ? (orders || []).filter((o: any) => o.status === 'pending')
    : orders || [];

  const pendingCount = (orders || []).filter((o: any) => o.status === 'pending').length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>审批中心</h1>
        <Badge variant="warning"><Clock size={12} /> {pendingCount} 待审批</Badge>
      </div>

        {/* 筛选 */}
        <div className="profile-tabs mb-lg">
          <button className={`profile-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
            待审批 ({pendingCount})
          </button>
          <button className={`profile-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            全部 ({orders?.length || 0})
          </button>
        </div>

        {isLoading ? (
          <SkeletonRows count={5} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState icon={<CheckCircle2 size={48} />} message="暂无待审批订单" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>商品</th>
                  <th>供应商</th>
                  <th>数量</th>
                  <th>金额</th>
                  <th>采购人</th>
                  <th>日期</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o: any) => (
                  <tr key={o.id}>
                    <td className="font-mono text-sm">{o.id}</td>
                    <td className="font-bold">{o.title}</td>
                    <td>{o.supplier}</td>
                    <td>{o.items}</td>
                    <td className="font-bold">{formatPrice(o.total)}</td>
                    <td>{o.buyer}</td>
                    <td className="text-sm">{o.date}</td>
                    <td>
                      <Badge variant={
                        o.status === 'approved' ? 'success' :
                        o.status === 'pending' ? 'warning' :
                        o.status === 'rejected' ? 'danger' : 'brand'
                      }>
                        {o.status === 'approved' ? '已批准' :
                         o.status === 'pending' ? '待审批' :
                         o.status === 'rejected' ? '已拒绝' : '已完成'}
                      </Badge>
                    </td>
                    <td>
                      {o.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-sm btn-success"
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate({ id: o.id, action: 'approve' })}
                          >
                            <CheckCircle2 size={14} /> 批准
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate({ id: o.id, action: 'reject' })}
                          >
                            <XCircle size={14} /> 拒绝
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}
