/* ============================================================
   采选AI平台 · Toast 通知组件
   参照 app.js 中 Toast 对象
   ============================================================ */

'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Bell,
  RefreshCw,
  X,
} from 'lucide-react';
import { useToastStore } from '@/store/toast';
import type { ToastType } from '@/lib/types';
import { cx } from '@/lib/utils';

const ICON_MAP: Record<ToastType, React.ComponentType<{ size?: number }>> = {
  error: AlertTriangle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Bell,
};

const COLOR_MAP: Record<ToastType, string> = {
  error: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
};

function ToastRow({
  id,
  type,
  title,
  message,
  retryFn,
}: {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  retryFn: (() => void) | null;
}) {
  const remove = useToastStore((s) => s.remove);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => remove(id), 280);
  };

  const Icon = ICON_MAP[type];

  return (
    <div
      className={cx('toast', type, visible ? 'toast-in' : 'toast-out')}
      role="alert"
    >
      <span className={cx('mt-px flex-shrink-0', COLOR_MAP[type])}>
        <Icon size={18} />
      </span>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        {message && <div className="toast-msg">{message}</div>}
        {retryFn && (
          <button
            type="button"
            className="toast-retry"
            onClick={() => {
              handleClose();
              retryFn();
            }}
          >
            <RefreshCw size={14} /> 重试
          </button>
        )}
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={handleClose}
        aria-label="关闭"
      >
        <X size={16} />
      </button>
      <style jsx>{`
        .toast-in {
          animation: toast-slide 0.3s ease-out forwards;
        }
        .toast-out {
          animation: toast-fade 0.3s ease-out forwards;
        }
        @keyframes toast-slide {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toast-fade {
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastRow
          key={t.id}
          id={t.id}
          type={t.type}
          title={t.title}
          message={t.message}
          retryFn={t.retryFn}
        />
      ))}
    </div>
  );
}
