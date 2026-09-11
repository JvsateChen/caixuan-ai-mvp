/* ============================================================
   采选AI平台 · 首页 (P0) - AI对话比价
   流式解析中间态 + 打字动画 + 迷你比价卡片 + 热门商品
   参照 index.html
   ============================================================ */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Send,
  TrendingDown,
  Zap,
  RefreshCw,
  Search,
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import { QueryState } from '@/components/QueryState';
import { ProductCard } from '@/components/ProductCard';
import {
  SkeletonRows,
  SkeletonCompareCards,
} from '@/components/Skeleton';
import { Badge, Spinner } from '@/components/ui/Badge';
import { useToastStore } from '@/store/toast';
import { api } from '@/lib/api';
import type { AiChatResponse, Product } from '@/lib/types';

/** 消息类型 */
type MsgRole = 'user' | 'ai';
type MsgStage = 'typing' | 'parsed' | 'done';

interface ChatMessage {
  id: string;
  role: MsgRole;
  text?: string;
  stage?: MsgStage;
  results?: Product[];
  query?: string;
}

const STEPS = [
  '正在解析商品关键词…',
  '查询三平台实时报价…',
  '对比最优价格…',
];

const QUICK_QUERIES = [
  'iPhone 15 Pro 比价',
  '兰蔻小黑瓶精华',
  'Sony 降噪耳机',
  '戴森吸尘器',
];

let msgCounter = 0;
const nextMsgId = () => `msg-${++msgCounter}`;

export default function HomePage() {
  const router = useRouter();
  const toast = useToastStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextMsgId(),
      role: 'ai',
      text: '你好!我是采选AI,输入商品名称即可获取拼多多、京东、淘宝三平台实时比价~',
      stage: 'done',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // 打字机效果 (文本逐字显示)
  const typeText = async (text: string, msgId: string) => {
    for (let i = 1; i <= text.length; i++) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, text: text.slice(0, i) } : m,
        ),
      );
      // 速度: 18ms/字
      await new Promise((r) => setTimeout(r, 18));
    }
  };

  // 发送AI对话
  const sendChat = async (query: string) => {
    const q = query.trim();
    if (!q || loading) return;

    setInput('');
    setLoading(true);

    // 用户消息
    const userMsg: ChatMessage = { id: nextMsgId(), role: 'user', text: q };
    // AI中间态消息 (3步文本)
    const aiMsg: ChatMessage = {
      id: nextMsgId(),
      role: 'ai',
      stage: 'typing',
      text: '',
      query: q,
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);

    // 3步流式中间态
    for (let i = 0; i < STEPS.length; i++) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id ? { ...m, text: STEPS[i] } : m,
        ),
      );
      await new Promise((r) => setTimeout(r, 600));
    }

    // 调用API
    try {
      const res: AiChatResponse = await api.aiChat(q);
      const summaryText =
        res.total > 0
          ? `为你找到 ${res.total} 个相关商品,最优价已为你高亮👇`
          : '暂未找到匹配商品,试试更通用的关键词吧~';

      // 打字机展示最终文本
      await typeText(summaryText, aiMsg.id);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id
            ? { ...m, stage: 'done', results: res.results }
            : m,
        ),
      );
    } catch (err) {
      const e = err as { message?: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id
            ? { ...m, stage: 'done', text: '查询失败,请稍后重试' }
            : m,
        ),
      );
      toast.error('AI对话失败', e.message ?? '请稍后重试', () => sendChat(q));
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat(input);
    }
  };

  const jumpToCompare = (q: string) => {
    router.push(`/compare?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="app-shell">
      <Topbar />
      <main className="main-content">
        {/* AI Hero */}
        <section className="ai-hero mb-lg">
          <Badge variant="brand" className="mb-sm" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
            <Sparkles size={12} /> AI 智能比价
          </Badge>
          <h1>一句话比三家 · 拼多多/京东/淘宝</h1>
          <p>AI解析关键词 · 30天价格走势 · 目标价预警 · 让采购更精明</p>
        </section>

        {/* AI Chat */}
        <section className="chat-card mb-lg">
          <div className="chat-card-body" ref={bodyRef}>
            {messages.map((m) => (
              <MessageRow
                key={m.id}
                msg={m}
                onProductClick={jumpToCompare}
              />
            ))}
          </div>
          <div className="chat-card-footer">
            <Search size={16} className="text-muted" style={{ marginLeft: 8 }} />
            <input
              type="text"
              placeholder="输入商品名,如 iPhone 15 Pro / 兰蔻小黑瓶"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onEnter}
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              onClick={() => sendChat(input)}
            >
              {loading ? <RefreshCw size={16} className="spin" /> : <Send size={16} />}
              发送
            </button>
          </div>
        </section>

        {/* Quick queries */}
        <div className="chat-quick-pills" style={{ maxWidth: 800, margin: '0 auto 24px' }}>
          {QUICK_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              className="chat-quick-pill"
              onClick={() => sendChat(q)}
            >
              <Zap size={12} /> {q}
            </button>
          ))}
        </div>

        {/* 热门商品 */}
        <section className="mt-lg">
          <div className="section-header">
            <h2>
              <TrendingDown size={18} className="price-down" style={{ verticalAlign: 'middle', marginRight: 6 }} />
              热门降价商品
            </h2>
            <a href="/compare" className="link-more" onClick={(e) => { e.preventDefault(); router.push('/compare'); }}>
              查看全部 →
            </a>
          </div>
          <QueryState
            queryKey={['products']}
            queryFn={api.getProducts}
            skeleton={
              <div className="grid grid-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="product-card">
                    <div className="skeleton skeleton-block" style={{ height: 160, borderRadius: 0 }} />
                    <div className="product-info">
                      <div className="skeleton skeleton-text w-80" />
                      <div className="skeleton skeleton-text w-40" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            {(products: Product[]) => (
              <div className="grid grid-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </QueryState>
        </section>

        {/* 热门搜索 */}
        <section className="mt-lg">
          <div className="section-header">
            <h2>热门搜索</h2>
          </div>
          <QueryState
            queryKey={['popular-searches']}
            queryFn={api.getPopularSearches}
            skeleton={<SkeletonRows count={3} />}
          >
            {(searches: string[]) => (
              <div className="chat-quick-pills">
                {searches.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="chat-quick-pill"
                    onClick={() => sendChat(q)}
                  >
                    <Search size={12} /> {q}
                  </button>
                ))}
              </div>
            )}
          </QueryState>
        </section>
      </main>
      <style>{`.spin { animation: spin 0.6s linear infinite; }`}</style>
    </div>
  );
}

/** 单条消息 */
function MessageRow({
  msg,
  onProductClick,
}: {
  msg: ChatMessage;
  onProductClick: (q: string) => void;
}) {
  const isAi = msg.role === 'ai';
  return (
    <div className={`chat-msg ${msg.role}`}>
      <div className={`chat-avatar ${isAi ? 'ai' : 'user'}`}>
        {isAi ? <Sparkles size={16} /> : <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>我</span>}
      </div>
      <div className="chat-bubble">
        {msg.stage === 'typing' && msg.text && (
          <div className="flex items-center gap-sm">
            <Spinner size={14} />
            <span>{msg.text}</span>
            <span className="chat-typing">
              <span></span><span></span><span></span>
            </span>
          </div>
        )}
        {msg.stage === 'done' && msg.text && <span>{msg.text}</span>}
        {msg.stage === 'done' && msg.results && msg.results.length > 0 && (
          <div className="mt-md" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msg.results.map((p) => (
              <MiniResultCard
                key={p.id}
                product={p}
                onClick={() => onProductClick(p.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 迷你比价卡 (AI对话结果) */
function MiniResultCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const best = product.platforms.reduce(
    (min, p) => (p.price < min.price ? p : min),
    product.platforms[0],
  );
  const achieved = best.price <= product.targetPrice;
  return (
    <div
      className={achieved ? 'rainbow-sweep' : ''}
      style={{
        border: '1px solid var(--color-rule)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        cursor: 'pointer',
        background: 'var(--color-surface-2)',
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-md">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="truncate" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {product.name}
          </div>
          <div className="flex items-center gap-sm mt-sm">
            <span className="price price-sm price-down">¥{best.price.toLocaleString()}</span>
            <span className="text-xs text-muted">{best.name} 最低</span>
            {achieved && (
              <Badge variant="success">
                <Sparkles size={10} /> 已达目标价
              </Badge>
            )}
          </div>
        </div>
        <span className="text-xs text-muted">查看详情 →</span>
      </div>
    </div>
  );
}
