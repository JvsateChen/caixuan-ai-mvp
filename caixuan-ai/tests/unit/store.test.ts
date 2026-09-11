/* 单元测试 — 状态管理 (Toast + 收藏夹) */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore } from '@/store/toast';

describe('Toast Store', () => {
  beforeEach(() => {
    // 清空 toast
    const store = useToastStore.getState();
    store.clear();
  });

  it('添加 error toast', () => {
    const store = useToastStore.getState();
    store.error('测试错误', '错误详情');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].type).toBe('error');
    expect(useToastStore.getState().toasts[0].title).toBe('测试错误');
  });

  it('添加 success toast', () => {
    const store = useToastStore.getState();
    store.success('成功', '操作成功');
    expect(useToastStore.getState().toasts[0].type).toBe('success');
  });

  it('添加 warning toast', () => {
    const store = useToastStore.getState();
    store.warning('警告', '请检查');
    expect(useToastStore.getState().toasts[0].type).toBe('warning');
  });

  it('添加 info toast', () => {
    const store = useToastStore.getState();
    store.info('提示', '信息');
    expect(useToastStore.getState().toasts[0].type).toBe('info');
  });

  it('remove toast by id', () => {
    const store = useToastStore.getState();
    store.success('标题', '消息');
    const id = useToastStore.getState().toasts[0].id;
    store.remove(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('带重试回调的 toast', () => {
    const store = useToastStore.getState();
    const retry = vi.fn();
    store.error('失败', '重试', retry);
    const toast = useToastStore.getState().toasts[0];
    expect(toast.retry).toBeDefined();
    toast.retry?.();
    expect(retry).toHaveBeenCalled();
  });
});
