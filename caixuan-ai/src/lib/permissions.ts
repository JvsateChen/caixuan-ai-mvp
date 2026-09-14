/* ============================================================
   采选AI平台 · 企业权限体系
   角色: enterprise_admin | finance | buyer | user
   权限矩阵控制 API 访问
   ============================================================ */

import type { AuthUser } from './auth';

export type EnterpriseRole = 'enterprise_admin' | 'finance' | 'buyer' | 'user';

/** 权限定义 */
export type Permission =
  | 'order:create'        // 创建订单
  | 'order:approve'       // 审批订单
  | 'order:reject'        // 拒绝订单
  | 'order:delete'        // 删除订单
  | 'supplier:create'     // 创建供应商
  | 'supplier:edit'       // 编辑供应商
  | 'supplier:delete'     // 删除供应商
  | 'budget:set'          // 设置预算
  | 'budget:view'         // 查看预算
  | 'analytics:view'      // 查看数据分析
  | 'enterprise:manage';  // 管理企业成员

/** 角色权限矩阵 */
const ROLE_PERMISSIONS: Record<EnterpriseRole, Permission[]> = {
  enterprise_admin: [
    'order:create', 'order:approve', 'order:reject', 'order:delete',
    'supplier:create', 'supplier:edit', 'supplier:delete',
    'budget:set', 'budget:view',
    'analytics:view',
    'enterprise:manage',
  ],
  finance: [
    'order:approve', 'order:reject',
    'budget:set', 'budget:view',
    'analytics:view',
  ],
  buyer: [
    'order:create', 'order:approve',
    'supplier:edit',
    'budget:view',
    'analytics:view',
  ],
  user: [],
};

/** 检查用户是否有指定权限 */
export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false;
  const role = user.role as EnterpriseRole;
  if (!(role in ROLE_PERMISSIONS)) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** 检查用户是否为企业用户 (有任意企业权限) */
export function isEnterpriseUser(user: AuthUser | null): boolean {
  if (!user) return false;
  return ['enterprise_admin', 'finance', 'buyer'].includes(user.role);
}

/** 权限守卫 — 用于 API 路由 */
export function requirePermission(user: AuthUser | null, permission: Permission): { allowed: boolean; error?: string } {
  if (!user) {
    return { allowed: false, error: '请先登录' };
  }
  if (!hasPermission(user, permission)) {
    return { allowed: false, error: '无操作权限' };
  }
  return { allowed: true };
}

/** 多级审批金额阈值 */
export const APPROVAL_THRESHOLDS = {
  // 金额 < 1000: 采购员可直接审批
  small: 1000,
  // 金额 1000-50000: 需部门经理审批
  medium: 50000,
  // 金额 > 50000: 需企业管理员审批
  large: Infinity,
};

/** 根据金额确定审批级别 */
export function getApprovalLevel(amount: number): 'self' | 'manager' | 'admin' {
  if (amount < APPROVAL_THRESHOLDS.small) return 'self';
  if (amount < APPROVAL_THRESHOLDS.medium) return 'manager';
  return 'admin';
}

/** 检查用户能否审批指定金额的订单 */
export function canApproveAmount(user: AuthUser | null, amount: number): boolean {
  if (!user) return false;
  const level = getApprovalLevel(amount);

  switch (level) {
    case 'self':
      return hasPermission(user, 'order:approve');
    case 'manager':
      return ['enterprise_admin', 'finance'].includes(user.role);
    case 'admin':
      return user.role === 'enterprise_admin';
    default:
      return false;
  }
}
