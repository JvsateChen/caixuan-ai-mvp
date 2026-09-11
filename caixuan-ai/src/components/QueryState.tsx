/* ============================================================
   采选AI平台 · 查询状态包装器
   骨架屏 → 数据 → 空状态/错误重试
   统一处理 TanStack Query 的 isLoading/isError/isEmpty
   ============================================================ */

'use client';

import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useToastStore } from '@/store/toast';
import { EmptyState } from './ui/Badge';
import type { ApiError } from '@/lib/types';

interface QueryStateProps<T> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  skeleton: ReactNode;
  empty?: (data: T) => boolean;
  emptyMessage?: string;
  children: (data: T) => ReactNode;
  /** 错误时是否自动 toast (默认true) */
  showErrorToast?: boolean;
}

export function QueryState<T>({
  queryKey,
  queryFn,
  skeleton,
  empty,
  emptyMessage = '暂无数据',
  children,
  showErrorToast = true,
}: QueryStateProps<T>) {
  const showError = useToastStore((s) => s.error);

  const { data, isLoading, isError, error, refetch } = useQuery<T>({
    queryKey,
    queryFn,
  });

  if (isLoading) return <>{skeleton}</>;

  if (isError) {
    const err = error as unknown as ApiError;
    const msg = err?.message ?? '数据获取异常';
    if (showErrorToast) {
      // 异步 toast (避免渲染期副作用)
      queueMicrotask(() =>
        showError('加载失败', msg, () => refetch()),
      );
    }
    return (
      <EmptyState
        message="加载失败"
        icon={<AlertTriangle size={32} />}
        action={
          <button
            type="button"
            className="btn btn-outline btn-sm mt-md"
            onClick={() => refetch()}
          >
            <RefreshCw size={14} /> 重试
          </button>
        }
      />
    );
  }

  if (empty && data && empty(data)) {
    return <EmptyState message={emptyMessage} />;
  }

  return data ? <>{children(data)}</> : null;
}
