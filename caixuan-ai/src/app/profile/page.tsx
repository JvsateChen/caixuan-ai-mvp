/* ============================================================
   采选AI平台 · 个人中心 (P1)
   比价历史 / 收藏夹(可删除) / 价格预警(开关toggle) / 个人信息
   参照 profile.html
   URL参数: tab (history/favorites/alerts/info)
   ============================================================ */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Clock,
  Heart,
  Bell,
  User,
  Trash2,
  ShoppingBag,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import { QueryState } from '@/components/QueryState';
import { SkeletonRows, SkeletonCard } from '@/components/Skeleton';
import { Badge, EmptyState, PlatformDot } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/Buttons';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toast';
import { useFavoritesStore } from '@/store/favorites';
import type {
  Product,
  MonitoringTarget,
  PurchaseRecord,
} from '@/lib/types';
import { cx, formatPrice, productImageUrl, platformColor } from '@/lib/utils';

type Tab = 'history' | 'favorites' | 'alerts' | 'info';

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'history', label: '比价历史', icon: Clock },
  { key: 'favorites', label: '收藏夹', icon: Heart },
  { key: 'alerts', label: '价格预警', icon: Bell },
  { key: 'info', label: '个人信息', icon: User },
];

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="app-shell">
          <Topbar />
          <main className="main-content">
            <div className="skeleton skeleton-title" style={{ width: '40%' }} />
          </main>
        </div>
      }
    >
      <ProfileInner />
    </Suspense>
  );
}

function ProfileInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initialTab = (params.get('tab') as Tab) ?? 'history';
  const [tab, setTab] = useState<Tab>(initialTab);

  // URL 同步
  useEffect(() => {
    const t = (params.get('tab') as Tab) ?? 'history';
    if (t !== tab) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onTabChange = (t: Tab) => {
    setTab(t);
    router.replace(`/profile?tab=${t}`);
  };

  return (
    <div className="app-shell">
      <Topbar />
      <main className="main-content" style={{ maxWidth: 960 }}>
        {/* 用户卡 */}
        <section className="card mb-lg" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>选</div>
          <div style={{ flex: 1 }}>
            <div className="font-bold" style={{ fontSize: '1.1rem' }}>采选用户</div>
            <div className="text-sm text-muted mt-sm">采选AI · 跨平台智能比价</div>
          </div>
          <Badge variant="brand">
            <Sparkles size={12} /> VIP
          </Badge>
        </section>

        {/* Tabs */}
        <div className="profile-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={cx('profile-tab', tab === t.key && 'active')}
              onClick={() => onTabChange(t.key)}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'history' && <HistoryTab />}
        {tab === 'favorites' && <FavoritesTab />}
        {tab === 'alerts' && <AlertsTab />}
        {tab === 'info' && <InfoTab />}
      </main>
    </div>
  );
}

/** 比价历史 (基于采购记录) */
function HistoryTab() {
  return (
    <QueryState
      queryKey={['purchase-records']}
      queryFn={api.getPurchaseRecords}
      skeleton={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      }
    >
      {(records: PurchaseRecord[]) => {
        if (records.length === 0)
          return <EmptyState message="暂无比价历史" icon={<Clock size={32} />} />;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {records.map((r) => (
              <div
                key={r.id}
                className="history-item"
                onClick={() => (window.location.href = `/detail?id=${encodeURIComponent(r.productId)}`)}
              >
                <div className="h-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImageUrl('phone')} alt={r.productName} loading="lazy" />
                </div>
                <div className="h-info">
                  <div className="h-name">{r.productName}</div>
                  <div className="h-meta">
                    <PlatformDot name={r.platform} />
                    {r.platform} · {r.orderDate} · 数量 {r.qty}
                  </div>
                </div>
                <div className="h-price">{formatPrice(r.total)}</div>
              </div>
            ))}
          </div>
        );
      }}
    </QueryState>
  );
}

/** 收藏夹 (可删除) */
function FavoritesTab() {
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);
  const toast = useToastStore();

  return (
    <QueryState
      queryKey={['products']}
      queryFn={api.getProducts}
      skeleton={<SkeletonRows count={3} />}
    >
      {(products: Product[]) => {
        const favProducts = products.filter((p) => favorites.includes(p.id));
        if (favProducts.length === 0)
          return <EmptyState message="收藏夹为空" icon={<Heart size={32} />} />;
        return (
          <div className="grid grid-2">
            {favProducts.map((p) => {
              const best = p.platforms.reduce(
                (min, x) => (x.price < min.price ? x : min),
                p.platforms[0],
              );
              return (
                <div key={p.id} className="card hover fav-item" style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="fav-remove"
                    aria-label="取消收藏"
                    onClick={() => {
                      toggleFav(p.id);
                      toast.success('已取消收藏', p.name);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex gap-md" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="product-img" style={{ width: 56, height: 56, borderRadius: 6, flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImageUrl(p.image)} alt={p.name} loading="lazy" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate font-bold" style={{ fontSize: '0.88rem' }}>
                        {p.name}
                      </div>
                      <div className="flex items-center gap-sm mt-sm" style={{ gap: 6, alignItems: 'center' }}>
                        <span className="price price-sm price-down">{formatPrice(best.price)}</span>
                        <Badge variant="muted">{best.name}</Badge>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`/detail?id=${encodeURIComponent(p.id)}`}
                    className="btn btn-ghost btn-sm btn-block mt-md"
                    style={{ marginTop: 12 }}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/detail?id=${encodeURIComponent(p.id)}`;
                    }}
                  >
                    <ShoppingBag size={14} /> 查看比价 <ExternalLink size={12} />
                  </a>
                </div>
              );
            })}
          </div>
        );
      }}
    </QueryState>
  );
}

/** 价格预警 (开关toggle) */
function AlertsTab() {
  return (
    <QueryState
      queryKey={['monitoring-targets']}
      queryFn={api.getMonitoringTargets}
      skeleton={<SkeletonRows count={4} />}
    >
      {(targets: MonitoringTarget[]) => {
        if (targets.length === 0)
          return <EmptyState message="暂无价格预警" icon={<Bell size={32} />} />;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {targets.map((t) => (
              <AlertItem key={t.id} target={t} />
            ))}
          </div>
        );
      }}
    </QueryState>
  );
}

function AlertItem({ target }: { target: MonitoringTarget }) {
  const setAlert = useFavoritesStore((s) => s.setAlert);
  const isOn = useFavoritesStore((s) => s.alertEnabled[target.productId] ?? true);

  return (
    <div className="alert-item">
      <span
        className={cx('a-status', target.status)}
        style={{
          background:
            target.status === 'achieved' ? 'var(--color-price-down)' : 'var(--color-price-flat)',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="truncate" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
          {target.productName}
        </div>
        <div className="text-xs text-muted mt-sm" style={{ marginTop: 4 }}>
          <PlatformDot name={target.platform} /> {target.platform} · 当前 ¥{target.currentPrice.toLocaleString()}
          {' · '}目标 ¥{target.targetPrice.toLocaleString()}
          {' · '}创建于 {target.createdAt}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Badge variant={target.status === 'achieved' ? 'success' : 'warning'}>
          {target.status === 'achieved' ? '已达成' : '监控中'}
        </Badge>
      </div>
      <button
        type="button"
        className={cx('alert-toggle', isOn && 'on')}
        aria-label="切换预警开关"
        onClick={() => setAlert(target.productId, !isOn)}
      />
    </div>
  );
}

/** 个人信息 */
function InfoTab() {
  const info = [
    { label: '用户ID', value: 'CX-2026-0001' },
    { label: '手机号', value: '138****8888' },
    { label: '会员等级', value: 'VIP 会员' },
    { label: '注册时间', value: '2026-08-01' },
    { label: '累计比价', value: '128 次' },
    { label: '累计节省', value: '¥4,872' },
    { label: '收藏商品', value: '6 件' },
    { label: '价格预警', value: '4 条' },
  ];
  return (
    <section className="card">
      <SectionHeader title="个人信息" />
      {info.map((row) => (
        <div key={row.label} className="info-row">
          <span className="info-label">{row.label}</span>
          <span className="info-value">{row.value}</span>
        </div>
      ))}
    </section>
  );
}
