/* ============================================================
   采选AI平台 · 商品卡片 / 比价卡片
   参照 compare.html 与 index.html 中卡片样式
   ============================================================ */

import Link from 'next/link';
import { ShoppingBag, ExternalLink, Trophy } from 'lucide-react';
import type { Product, PlatformQuote } from '@/lib/types';
import {
  cx,
  formatPrice,
  productImageUrl,
  platformColor,
} from '@/lib/utils';
import { PriceTag, Sparkline } from './ui/PriceTag';
import { Badge, PlatformDot } from './ui/Badge';

/** 商品卡片 (网格展示) */
export function ProductCard({ product }: { product: Product }) {
  const href = `/detail?id=${encodeURIComponent(product.id)}`;
  return (
    <Link
      href={href}
      className="product-card"
    >
      <div className="product-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={productImageUrl(product.image)} alt={product.name} loading="lazy" />
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <span className="product-price">{formatPrice(product.lowest)}</span>
          <Sparkline data={product.sparkline} width={60} height={20} />
        </div>
      </div>
    </Link>
  );
}

/** 比价卡片 (单平台报价) */
export function CompareCard({
  quote,
  isBest,
}: {
  quote: PlatformQuote;
  isBest: boolean;
}) {
  return (
    <div className={cx('compare-card', isBest && 'best', isBest && 'rainbow-sweep')}>
      {isBest && (
        <span className="best-flag">
          <Trophy size={12} /> 最优价
        </span>
      )}
      <div className="compare-platform">
        <PlatformDot name={quote.name} />
        <span style={{ color: platformColor(quote.name) }}>{quote.name}</span>
      </div>
      <div
        className={cx(
          'compare-price',
          quote.trend === 'down' ? 'price-down' : quote.trend === 'up' ? 'price-up' : 'price-flat',
        )}
      >
        {formatPrice(quote.price)}
      </div>
      <div className="compare-trend">
        <span className={cx(
          'price-trend',
          quote.trend === 'down' ? 'price-down' : quote.trend === 'up' ? 'price-up' : 'price-flat',
        )}>
          {quote.trend === 'down' ? '↓' : quote.trend === 'up' ? '↑' : '−'}{' '}
          {quote.delta !== 0 ? formatPrice(Math.abs(quote.delta)) : '持平'}
        </span>
        <span className="text-muted text-xs" style={{ marginLeft: 6 }}>
          昨日 {formatPrice(quote.prevPrice)}
        </span>
      </div>
      <a
        href={quote.url}
        className="btn btn-primary btn-sm"
        onClick={(e) => e.preventDefault()}
      >
        <ShoppingBag size={14} /> 去购买 <ExternalLink size={12} />
      </a>
    </div>
  );
}

/** 迷你比价卡 (AI对话结果) */
export function MiniCompareCard({ product }: { product: Product }) {
  const href = `/compare?q=${encodeURIComponent(product.name)}`;
  const best = product.platforms.reduce(
    (min, p) => (p.price < min.price ? p : min),
    product.platforms[0],
  );
  return (
    <Link
      href={href}
      className="card hover"
      style={{ display: 'block', padding: 16 }}
    >
      <div className="flex items-center gap-md">
        <div
          className="product-img"
          style={{ width: 64, height: 64, borderRadius: 8, flexShrink: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImageUrl(product.image)} alt={product.name} loading="lazy" />
        </div>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="truncate font-bold" style={{ fontSize: '0.88rem' }}>
            {product.name}
          </div>
          <div className="flex items-center gap-sm mt-sm">
            <Badge variant={best.price <= product.targetPrice ? 'success' : 'muted'}>
              最低 ¥{best.price.toLocaleString()}
            </Badge>
            <span className="text-xs text-muted">{best.name}</span>
          </div>
        </div>
        <Sparkline data={product.sparkline} width={70} height={22} />
      </div>
    </Link>
  );
}

/** 平台对比表行 (详情页) */
export function PlatformRow({
  quote,
  isBest,
}: {
  quote: PlatformQuote;
  isBest: boolean;
}) {
  return (
    <tr className={cx(isBest && 'rainbow-sweep')}>
      <td>
        <PlatformDot name={quote.name} />
        <span style={{ color: platformColor(quote.name), fontWeight: 500 }}>
          {quote.name}
        </span>
        {isBest && <Badge variant="success" className="ml-sm">最优</Badge>}
      </td>
      <td>
        <PriceTag value={quote.price} size="md" trend={quote.trend} />
      </td>
      <td className="text-muted">{formatPrice(quote.prevPrice)}</td>
      <td>
        <span
          className={cx(
            'price-trend',
            quote.trend === 'down' ? 'price-down' : quote.trend === 'up' ? 'price-up' : 'price-flat',
          )}
        >
          {quote.delta > 0 ? '+' : ''}
          {formatPrice(quote.delta)}
        </span>
      </td>
      <td>
        <a
          href={quote.url}
          className="btn btn-ghost btn-sm"
          onClick={(e) => e.preventDefault()}
        >
          <ShoppingBag size={14} /> 购买
        </a>
      </td>
    </tr>
  );
}
