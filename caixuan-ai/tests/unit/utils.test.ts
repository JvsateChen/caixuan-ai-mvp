/* 单元测试 — 工具函数 */
import { describe, it, expect } from 'vitest';
import { cx, formatPrice, formatNumber, formatWan, platformColor } from '@/lib/utils';

describe('cx — 类名合并', () => {
  it('合并多个类名', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c');
  });

  it('过滤 falsy 值', () => {
    expect(cx('a', false, null, undefined, '' as any, 'b')).toBe('a b');
  });

  it('支持条件表达式', () => {
    const active = true;
    expect(cx('btn', active && 'active', !active && 'inactive')).toBe('btn active');
  });
});

describe('formatPrice — 价格格式化', () => {
  it('格式化整数价格', () => {
    expect(formatPrice(7299)).toBe('¥7,299');
  });

  it('格式化小数价格', () => {
    expect(formatPrice(1050.5)).toBe('¥1,050.5');
  });

  it('处理0值', () => {
    expect(formatPrice(0)).toBe('¥0');
  });
});

describe('formatNumber — 数字格式化', () => {
  it('添加千位分隔符', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('小数不添加分隔符', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });
});

describe('formatWan — 万级格式化', () => {
  it('小于1万返回带¥的万格式', () => {
    expect(formatWan(5000)).toBe('¥0.5万');
  });

  it('大于1万转为万', () => {
    expect(formatWan(268112)).toBe('¥26.8万');
  });
});

describe('platformColor — 平台色映射', () => {
  it('返回拼多多红色', () => {
    expect(platformColor('拼多多' as any)).toBe('#e02130');
  });

  it('返回京东蓝色', () => {
    expect(platformColor('京东' as any)).toBe('#1677ff');
  });

  it('返回淘宝橙色', () => {
    expect(platformColor('淘宝' as any)).toBe('#ff6a00');
  });

  it('未知平台返回默认色', () => {
    expect(platformColor('未知' as any)).toBe('#94a3b8');
  });
});
