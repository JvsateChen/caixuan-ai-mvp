/* ============================================================
   采选AI平台 · 供应商管理页 (P2)
   供应商列表 + 创建 + 编辑
   ============================================================ */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Star, Phone, User, Building2, Pencil } from 'lucide-react';
import { Badge, EmptyState, Spinner } from '@/components/ui/Badge';
import { SkeletonRows } from '@/components/Skeleton';
import { useToastStore } from '@/store/toast';
import { formatPrice } from '@/lib/utils';

export default function SuppliersPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', contact: '', phone: '', rating: 0 });
  const toast = useToastStore();
  const qc = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await fetch('/api/enterprise/suppliers');
      if (!res.ok) throw new Error('加载失败');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/enterprise/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('创建失败');
      return res.json();
    },
    onSuccess: () => {
      toast.success('创建成功', '供应商已添加');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setShowForm(false);
      setFormData({ name: '', category: '', contact: '', phone: '', rating: 0 });
    },
    onError: () => toast.error('创建失败', '请稍后重试'),
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>供应商管理</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> 添加供应商
        </button>
      </div>

        {showForm && (
          <section className="card mb-lg" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 12 }}>新建供应商</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input className="input" placeholder="供应商名称" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input className="input" placeholder="类目" value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              <input className="input" placeholder="联系人" value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
              <input className="input" placeholder="联系电话" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <input className="input" type="number" placeholder="评分 (0-5)" value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} />
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-primary"
                disabled={!formData.name || !formData.category || createMutation.isPending}
                onClick={() => createMutation.mutate(formData)}
              >
                {createMutation.isPending ? <Spinner size={16} /> : '保存'}
              </button>
            </div>
          </section>
        )}

        {isLoading ? (
          <SkeletonRows count={6} />
        ) : suppliers?.length === 0 ? (
          <EmptyState icon={<Building2 size={48} />} message="暂无供应商" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>供应商</th>
                  <th>类目</th>
                  <th>联系人</th>
                  <th>电话</th>
                  <th>评分</th>
                  <th>订单数</th>
                  <th>总金额</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {suppliers?.map((s: any) => (
                  <tr key={s.id}>
                    <td className="font-bold">{s.name}</td>
                    <td>{s.category}</td>
                    <td><User size={14} style={{ display: 'inline', marginRight: 4 }} />{s.contact || '-'}</td>
                    <td><Phone size={14} style={{ display: 'inline', marginRight: 4 }} />{s.phone || '-'}</td>
                    <td>
                      <span style={{ color: '#d97706' }}>
                        {'★'.repeat(Math.round(s.rating || 0))}
                      </span>
                      {s.rating || 0}
                    </td>
                    <td>{s.total_orders}</td>
                    <td className="font-bold">{formatPrice(s.total_amount)}</td>
                    <td>
                      <Badge variant={s.status === 'active' ? 'success' : 'muted'}>
                        {s.status === 'active' ? '合作中' : '已停用'}
                      </Badge>
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
