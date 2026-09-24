/* ============================================================
   采选AI平台 · 比价结果页 (P0)
   三平台比价卡片(含排序/最优价高亮/彩虹流光) + 价格统计 + 相关推荐
   参照 compare.html
   URL参数: q (搜索词)
   ============================================================ */

'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Trophy, TrendingDown, Sparkles } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { QueryState } from '@/components/QueryState';
import { CompareCard } from '@/components/ProductCard';
import { SkeletonCompareCards, SkeletonRows } from '@/components/Skeleton';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/PriceTag';
import { Breadcrumb, SectionHeader } from '@/components/ui/Buttons';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toast';
import type { Product, PlatformQuote } from '@/lib/types';
import { formatPrice, productImageUrl, cx } from '@/lib/utils';

type SortKey = 'price' | 'platform' | 'delta';

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="app-shell">
          <Topbar />
          <main className="main-content">
            <div className="skeleton skeleton-title" style={{ width: '40%' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          </main>
        </div>
      }
    >
      <CompareInner />
    </Suspense>
  );
}

function CompareInner() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const [sort, setSort] = useState<SortKey>('price');
  const toast = useToastStore();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: api.getProducts,
  });

  // 错误 toast
  if (isError && !isLoading) {
    const e = error as { message?: string };
    queueMicrotask(() =>
      toast.error('加载失败', e?.message ?? '请稍后重试', () => refetch()),
    );
  }

  const matched = useMemo(() => {
    if (!data) return [];
    const lower = q.toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        q.includes(p.brand),
    );
  }, [data, q]);

  const stats = useMemo(() => {
    if (matched.length === 0) return null;
    const allQuotes = matched.flatMap((p) => p.platforms);
    const lowest = Math.min(...allQuotes.map((x) => x.price));
    const highest = Math.max(...allQuotes.map((x) => x.price));
    const avg = Math.round(
      allQuotes.reduce((s, x) => s + x.price, 0) / allQuotes.length,
    );
    const saved = highest - lowest;
    return { lowest, highest, avg, saved, count: matched.length };
  }, [matched]);

  const sortQuotes = (quotes: PlatformQuote[]) => {
    const arr = [...quotes];
    if (sort === 'price') arr.sort((a, b) => a.price - b.price);
    else if (sort === 'delta')
      arr.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    else arr.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    return arr;
  };

  return (
    <div className="app-shell">
      <Topbar />
      <main className="main-content">
        <Breadcrumb
          items={[
            { label: '首页', href: '/' },
            { label: '比价结果' },
            ...(q ? [{ label: q }] : []),
          ]}
        />

        <div className="flex align-center gap-md mb-lg" style={{ alignItems: 'center' }}>
          <Search size={20} className="text-brand-1" />
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {q ? `「${q}」比价结果` : '全部商品比价'}
          </h1>
          {stats && (
            <Badge variant="brand" className="ml-sm">
              {stats.count} 个商品
            </Badge>
          )}
        </div>
        <p className="page-subtitle">
          实时对比拼多多、京东、淘宝三平台报价 · 最优价高亮 · 目标价达成彩虹流光
        </p>

        {/* 价格统计 */}
        {stats && (
          <div className="grid grid-4 mb-lg">
            <StatCard
              icon={<Trophy size={20} className="text-success" />}
              value={formatPrice(stats.lowest)}
              label="全网最低价"
              change={`省 ${formatPrice(stats.saved)}`}
              changeTrend="down"
            />
            <StatCard
              icon={<span className="price-up" style={{ fontWeight: 700 }}>↑</span>}
              value={formatPrice(stats.highest)}
              label="全网最高价"
            />
            <StatCard
              icon={<span className="price-flat" style={{ fontWeight: 700 }}>−</span>}
              value={formatPrice(stats.avg)}
              label="三平台均价"
            />
            <StatCard
              icon={<TrendingDown size={20} className="text-success" />}
              value={`${stats.count}`}
              label="比价商品数"
              unit="件"
            />
          </div>
        )}

        {/* 排序 */}
        <div className="flex items-center justify-between mb-md" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionHeader title="三平台报价对比" />
          <div className="sort-group">
            <button
              type="button"
              className={cx('sort-btn', sort === 'price' && 'active')}
              onClick={() => setSort('price')}
            >
              按价格
            </button>
            <button
              type="button"
              className={cx('sort-btn', sort === 'delta' && 'active')}
              onClick={() => setSort('delta')}
            >
              按降幅
            </button>
            <button
              type="button"
              className={cx('sort-btn', sort === 'platform' && 'active')}
              onClick={() => setSort('platform')}
            >
              按平台
            </button>
          </div>
        </div>

        {/* 商品比价列表 */}
        {isLoading ? (
          <>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="mb-lg">
                <SkeletonCompareCards />
              </div>
            ))}
          </>
        ) : isError ? (
          <EmptyState
            message="加载失败"
            icon={<Search size={32} />}
            action={
              <button
                type="button"
                className="btn btn-outline btn-sm mt-md"
                onClick={() => refetch()}
              >
                重试
              </button>
            }
          />
        ) : matched.length === 0 ? (
          <EmptyState message={`未找到「${q}」相关商品`} icon={<Search size={32} />} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {matched.map((p) => {
              const sorted = sortQuotes(p.platforms);
              const best = sorted[0];
              const achieved = best.price <= p.targetPrice;
              return (
                <div key={p.id} className={cx('card', achieved && 'rainbow-sweep')}>
                  <div className="flex items-center gap-md mb-md" style={{ alignItems: 'center' }}>
                    <div
                      className="product-img"
                      style={{ width: 64, height: 64, borderRadius: 8, flexShrink: 0 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImageUrl(p.image)} alt={p.name} loading="lazy" />
                    </div>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="font-bold" style={{ fontSize: '0.95rem' }}>
                        {p.name}
                      </div>
                      <div className="text-xs text-muted mt-sm">
                        {p.brand} · {p.spec} · {p.category}
                      </div>
                    </div>
                    {achieved && (
                      <span className="rainbow-badge">
                        <Sparkles size={12} /> 目标价达成
                      </span>
                    )}
                    <a
                      href={`/detail?id=${encodeURIComponent(p.id)}`}
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/detail?id=${encodeURIComponent(p.id)}`;
                      }}
                    >
                      查看详情 →
                    </a>
                  </div>
                  <div className="compare-grid">
                    {sorted.map((quote) => (
                      <CompareCard
                        key={quote.name}
                        quote={quote}
                        isBest={quote.name === best.name}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 相关推荐 */}
        {matched.length > 0 && (
          <section className="mt-lg">
            <SectionHeader title="相关推荐" />
            <QueryState
              queryKey={['products', 'related']}
              queryFn={api.getProducts}
              skeleton={<SkeletonRows count={3} />}
            >
              {(products: Product[]) => {
                const recs = products
                  .filter((p) => !matched.find((m) => m.id === p.id))
                  .slice(0, 4);
                if (recs.length === 0)
                  return <EmptyState message="暂无更多推荐" />;
                return (
                  <div className="grid grid-4">
                    {recs.map((p) => (
                      <RecommendCard key={p.id} product={p} />
                    ))}
                  </div>
                );
              }}
            </QueryState>
          </section>
        )}
      </main>
    </div>
  );
}

/** 相关推荐小卡 */
function RecommendCard({ product }: { product: Product }) {
  const best = product.platforms.reduce(
    (min, p) => (p.price < min.price ? p : min),
    product.platforms[0],
  );
  return (
    <a
      href={`/detail?id=${encodeURIComponent(product.id)}`}
      className="card hover"
      style={{ display: 'block' }}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = `/detail?id=${encodeURIComponent(product.id)}`;
      }}
    >
      <div className="product-img" style={{ height: 120, borderRadius: 8, marginBottom: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={productImageUrl(product.image)} alt={product.name} loading="lazy" />
      </div>
      <div className="truncate font-bold" style={{ fontSize: '0.85rem' }}>
        {product.name}
      </div>
      <div className="flex items-center justify-between mt-sm" style={{ justifyContent: 'space-between' }}>
        <span className="price price-sm price-down">{formatPrice(best.price)}</span>
        <Badge variant="muted">{best.name}</Badge>
      </div>
    </a>
  );
}
