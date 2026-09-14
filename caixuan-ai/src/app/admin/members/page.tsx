/* ============================================================
   采选AI平台 · 企业成员管理 (P2)
   成员列表 + 角色分配
   ============================================================ */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Shield, UserCog } from 'lucide-react';
import { Badge, EmptyState, Spinner } from '@/components/ui/Badge';
import { SkeletonRows } from '@/components/Skeleton';
import { useToastStore } from '@/store/toast';

const ROLES = [
  { key: 'enterprise_admin', label: '企业管理员', variant: 'brand' as const },
  { key: 'finance', label: '财务', variant: 'success' as const },
  { key: 'buyer', label: '采购员', variant: 'warning' as const },
  { key: 'user', label: '普通用户', variant: 'muted' as const },
];

export default function MembersPage() {
  const toast = useToastStore();
  const qc = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['enterprise-members'],
    queryFn: async () => {
      const res = await fetch('/api/enterprise/members');
      if (!res.ok) throw new Error('加载失败');
      return res.json();
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch('/api/enterprise/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (!res.ok) throw new Error('更新失败');
      return res.json();
    },
    onSuccess: () => {
      toast.success('已更新', '成员角色已修改');
      qc.invalidateQueries({ queryKey: ['enterprise-members'] });
    },
    onError: () => toast.error('更新失败', '请稍后重试'),
  });

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Users size={24} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>成员管理</h1>
      </div>

        {/* 角色说明 */}
        <section className="card mb-lg" style={{ padding: 16 }}>
          <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} /> 角色权限说明
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {ROLES.map((r) => (
              <div key={r.key} style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <Badge variant={r.variant}>{r.label}</Badge>
                <p className="text-sm text-muted mt-sm" style={{ marginTop: 8 }}>
                  {r.key === 'enterprise_admin' && '全部权限 + 企业设置 + 成员管理'}
                  {r.key === 'finance' && '审批订单 + 预算管理 + 数据分析'}
                  {r.key === 'buyer' && '创建订单 + 审批小订单 + 供应商管理'}
                  {r.key === 'user' && '基础功能: 比价 + 收藏 + 预警'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {isLoading ? (
          <SkeletonRows count={5} />
        ) : members?.length === 0 ? (
          <EmptyState icon={<UserCog size={48} />} message="暂无成员" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>手机号</th>
                  <th>当前角色</th>
                  <th>加入时间</th>
                  <th>分配角色</th>
                </tr>
              </thead>
              <tbody>
                {members?.map((m: any) => (
                  <tr key={m.id}>
                    <td className="font-bold">{m.nickname}</td>
                    <td>{m.phone || '-'}</td>
                    <td>
                      <Badge variant={ROLES.find((r) => r.key === m.role)?.variant || 'muted'}>
                        {ROLES.find((r) => r.key === m.role)?.label || m.role}
                      </Badge>
                    </td>
                    <td className="text-sm">{m.created_at?.slice(0, 10)}</td>
                    <td>
                      <select
                        className="input"
                        value={m.role}
                        disabled={roleMutation.isPending}
                        onChange={(e) => roleMutation.mutate({ userId: m.id, role: e.target.value })}
                        style={{ padding: '4px 8px', fontSize: 13, width: 'auto' }}
                      >
                        {ROLES.map((r) => (
                          <option key={r.key} value={r.key}>{r.label}</option>
                        ))}
                      </select>
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
