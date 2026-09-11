/* ============================================================
   采选AI平台 · 商品详情页 (P0)
   30天价格走势图(Recharts) + 三平台对比表 + 价格预警表单
   参照 detail.html
   URL参数: id (商品ID)
   ============================================================ */

'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Target,
  TrendingDown,
  ShoppingCart,
  Star,
  Bell,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import { PlatformRow } from '@/components/ProductCard';
import { SkeletonText, SkeletonTable } from '@/components/Skeleton';
import { Badge, EmptyState, Spinner } from '@/components/ui/Badge';
import { PriceTag, StatCard } from '@/components/ui/PriceTag';
import { Breadcrumb, SectionHeader, BackButton } from '@/components/ui/Buttons';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toast';
import { useFavoritesStore } from '@/store/favorites';
import type { PriceHistory, Product } from '@/lib/types';
import { formatPrice, productImageUrl, cx } from '@/lib/utils';

export default function DetailPage() {
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
      <DetailInner />
    </Suspense>
  );
}

function DetailInner() {
  const params = useSearchParams();
  const id = params.get('id') ?? 'P001';
  const toast = useToastStore();
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);
  const isFav = useFavoritesStore((s) => s.favorites.includes(id));

  // 商品详情
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProductDetail(id),
  });

  // 价格历史
  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['price-history', id],
    queryFn: () => api.getPriceHistory(id),
  });

  // 错误 toast
  if (isError && !isLoading) {
    const e = error as { message?: string };
    queueMicrotask(() =>
      toast.error('商品加载失败', e?.message ?? '请稍后重试', () => refetch()),
    );
  }
  if (historyError && !historyLoading) {
    queueMicrotask(() =>
      toast.error('走势图加载失败', '请稍后重试', () => refetchHistory()),
    );
  }

  return (
    <div className="app-shell">
      <Topbar />
      <main className="main-content">
        <Breadcrumb
          items={[
            { label: '首页', href: '/' },
            { label: '比价', href: '/compare' },
            { label: product?.name ?? '商品详情' },
          ]}
        />
        <BackButton fallback="/compare" />

        {/* 商品头部 */}
        {isLoading ? (
          <div className="card mb-lg">
            <div className="flex gap-lg" style={{ gap: 24 }}>
              <div className="skeleton skeleton-block" style={{ width: 200, height: 200, borderRadius: 8 }} />
              <div className="flex-1">
                <SkeletonText width="80%" height={24} />
                <SkeletonText width="40%" />
                <SkeletonText width="60%" />
                <SkeletonText width="30%" height={28} />
              </div>
            </div>
          </div>
        ) : isError ? (
          <EmptyState
            message="商品加载失败"
            action={
              <button type="button" className="btn btn-outline btn-sm mt-md" onClick={() => refetch()}>
                <RefreshCw size={14} /> 重试
              </button>
            }
          />
        ) : product ? (
          <ProductHeader
            product={product}
            isFav={isFav}
            onToggleFav={() => {
              toggleFav(product.id);
              toast.success(isFav ? '已取消收藏' : '收藏成功');
            }}
          />
        ) : null}

        {/* 价格走势图 */}
        <section className="card mb-lg">
          <SectionHeader
            title={
              <span className="flex items-center gap-sm">
                <TrendingDown size={18} className="text-success" /> 30天价格走势
              </span>
            }
          />
          {historyLoading ? (
            <div className="skeleton skeleton-block" style={{ height: 320, borderRadius: 8 }} />
          ) : historyError || !history ? (
            <EmptyState
              message="走势图加载失败"
              action={
                <button type="button" className="btn btn-outline btn-sm mt-md" onClick={() => refetchHistory()}>
                  <RefreshCw size={14} /> 重试
                </button>
              }
            />
          ) : (
            <PriceChart history={history} />
          )}
        </section>

        {/* 价格统计 */}
        {history && (
          <div className="grid grid-4 mb-lg">
            <StatCard
              icon={<TrendingDown size={20} className="text-success" />}
              value={formatPrice(history.stats.lowest)}
              label="30天最低"
              change="历史最优"
              changeTrend="down"
            />
            <StatCard
              icon={<span className="price-up" style={{ fontWeight: 700 }}>↑</span>}
              value={formatPrice(history.stats.highest)}
              label="30天最高"
            />
            <StatCard
              icon={<span className="price-flat" style={{ fontWeight: 700 }}>−</span>}
              value={formatPrice(history.stats.avg)}
              label="30天均价"
            />
            <StatCard
              icon={<Target size={20} className="text-brand-1" />}
              value={formatPrice(history.stats.current)}
              label="当前价"
              change={product && history.stats.current <= product.targetPrice ? '已达目标' : '监控中'}
              changeTrend={product && history.stats.current <= product.targetPrice ? 'down' : 'flat'}
            />
          </div>
        )}

        {/* 三平台对比表 */}
        <section className="card mb-lg">
          <SectionHeader title="三平台报价对比" />
          {isLoading ? (
            <SkeletonTable rows={3} cols={5} />
          ) : product ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>平台</th>
                    <th>当前价</th>
                    <th>昨日价</th>
                    <th>变动</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {[...product.platforms]
                    .sort((a, b) => a.price - b.price)
                    .map((q, i) => (
                      <PlatformRow key={q.name} quote={q} isBest={i === 0} />
                    ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        {/* 价格预警表单 */}
        {product && (
          <AlertForm productId={product.id} targetPrice={product.targetPrice} />
        )}
      </main>
    </div>
  );
}

/** 商品头部 */
function ProductHeader({
  product,
  isFav,
  onToggleFav,
}: {
  product: Product;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const best = [...product.platforms].sort((a, b) => a.price - b.price)[0];
  const achieved = best.price <= product.targetPrice;
  return (
    <section className={cx('card mb-lg', achieved && 'rainbow-sweep')}>
      <div className="flex gap-lg" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div
          className="product-img"
          style={{ width: 200, height: 200, borderRadius: 8, flexShrink: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImageUrl(product.image)} alt={product.name} loading="lazy" />
        </div>
        <div className="flex-1" style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-sm" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <Badge variant="brand">{product.category}</Badge>
            <Badge variant="muted">{product.brand}</Badge>
            {achieved && (
              <Badge variant="success">
                <Sparkles size={12} /> 已达目标价
              </Badge>
            )}
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>
            {product.name}
          </h1>
          <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
            规格: {product.spec}
          </p>
          <div className="flex items-center gap-md" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <PriceTag value={best.price} size="lg" trend={best.trend} />
            <span className="text-sm text-muted">{best.name} 最低</span>
          </div>
          <div className="flex gap-sm" style={{ display: 'flex', gap: 8 }}>
            <a
              href={best.url}
              className="btn btn-primary"
              onClick={(e) => e.preventDefault()}
            >
              <ShoppingCart size={16} /> 立即购买({best.name})
            </a>
            <button
              type="button"
              className={cx('btn', isFav ? 'btn-primary' : 'btn-outline')}
              onClick={onToggleFav}
            >
              <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 价格走势图 (Recharts) */
function PriceChart({ history }: { history: PriceHistory }) {
  // 合并三平台数据按日期
  const chartData = useMemo(() => {
    return history.dates.map((date, i) => {
      const row: Record<string, string | number> = { date };
      history.platforms.forEach((p) => {
        row[p.name] = p.data[i];
      });
      return row;
    });
  }, [history]);

  return (
    <>
      <div className="chart-legend">
        {history.platforms.map((p) => (
          <span key={p.name} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: p.color }} />
            {p.name}
          </span>
        ))}
      </div>
      <div className="chart-container" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, bottom: 5, left: 10 }}
          >
            <CartesianGrid strokeDasharray="2 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(v) => `¥${v}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => formatPrice(Number(v))}
              labelFormatter={(l) => `日期 ${l}`}
            />
            {history.platforms.map((p) => (
              <Line
                key={p.name}
                type="monotone"
                dataKey={p.name}
                stroke={p.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                // 末端圆点
                isAnimationActive={true}
                animationDuration={600}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* 末端圆点 (Recharts 原生不支持, 用 SVG overlay) */}
      <EndpointDots history={history} />
    </>
  );
}

/** 末端圆点 overlay */
function EndpointDots({ history }: { history: PriceHistory }) {
  // 此处简化: Recharts 自带 activeDot,末端圆点不重复绘制
  return null;
}

/** 价格预警表单 */
function AlertForm({
  productId,
  targetPrice,
}: {
  productId: string;
  targetPrice: number;
}) {
  const [price, setPrice] = useState(String(targetPrice));
  const [submitting, setSubmitting] = useState(false);
  const toast = useToastStore();

  const onSubmit = async () => {
    const target = Number(price);
    if (!target || target <= 0) {
      toast.warning('请输入有效价格', '价格需大于 0');
      return;
    }
    setSubmitting(true);
    try {
      await api.setPriceAlert(productId, target);
      toast.success('预警设置成功', `目标价 ${formatPrice(target)}`);
    } catch (err) {
      const e = err as { message?: string };
      toast.error('设置失败', e?.message ?? '请稍后重试', () => onSubmit());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <SectionHeader
        title={
          <span className="flex items-center gap-sm">
            <Bell size={18} className="text-brand-1" /> 价格预警设置
          </span>
        }
      />
      <p className="text-muted text-sm mb-md">
        设置目标价,当任一平台价格达到或低于目标时,我们将通过站内消息/短信通知您。
      </p>
      <div className="flex gap-sm" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">目标价 (¥)</label>
          <input
            type="number"
            className="form-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="输入目标价"
            min={0}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={submitting}
          onClick={onSubmit}
        >
          {submitting ? <Spinner size={14} /> : <Target size={16} />}
          设置预警
        </button>
      </div>
      <div className="text-xs text-muted mt-sm" style={{ marginTop: 8 }}>
        当前目标价: {formatPrice(targetPrice)} · 建议低于全网均价以获取更好折扣
      </div>
    </section>
  );
}
