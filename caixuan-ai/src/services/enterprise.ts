/* ============================================================
   采选AI平台 · 企业采购服务层
   订单 CRUD + 审批流 + 预算管理 + 供应商管理
   ============================================================ */

import { getDb } from '@/lib/db';
import type { EnterpriseOrder, EnterpriseStats, SupplierCompare } from '@/lib/types';

// ============================================================
// 订单管理
// ============================================================

/** 查询全部企业订单 */
export function getOrders(): EnterpriseOrder[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM enterprise_orders ORDER BY date DESC
  `).all() as EnterpriseOrder[];
}

/** 按 ID 查询订单 */
export function getOrderById(id: string): EnterpriseOrder | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM enterprise_orders WHERE id = ?').get(id) as EnterpriseOrder) || null;
}

/** 创建企业订单 */
export function createOrder(data: {
  title: string;
  supplier: string;
  items: number;
  total: number;
  buyer: string;
  buyerId?: string;
}): EnterpriseOrder {
  const db = getDb();
  const id = `PO-${Date.now()}`;
  const today = new Date().toISOString().slice(0, 10);

  db.prepare(`
    INSERT INTO enterprise_orders (id, title, supplier, items, total, status, date, buyer, buyer_id)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(id, data.title, data.supplier, data.items, data.total, today, data.buyer, data.buyerId || null);

  // 更新供应商统计
  db.prepare(`
    UPDATE suppliers SET total_orders = total_orders + 1, total_amount = total_amount + ?
    WHERE name = ?
  `).run(data.total, data.supplier);

  return getOrderById(id)!;
}

/** 更新订单状态 */
export function updateOrderStatus(id: string, status: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE enterprise_orders SET status = ? WHERE id = ?
  `).run(status, id);
  return result.changes > 0;
}

/** 审批订单 — 记录审批 + 更新状态 */
export function approveOrder(
  orderId: string,
  approverId: string,
  approverName: string,
  action: 'approve' | 'reject',
  comment?: string,
): boolean {
  const db = getDb();
  const order = getOrderById(orderId);
  if (!order) return false;

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  const txn = db.transaction(() => {
    // 更新订单状态
    db.prepare('UPDATE enterprise_orders SET status = ? WHERE id = ?').run(newStatus, orderId);

    // 记录审批
    const approvalId = `AP-${Date.now()}`;
    db.prepare(`
      INSERT INTO approval_records (id, order_id, approver_id, approver_name, action, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(approvalId, orderId, approverId, approverName, action, comment || '');

    // 如果审批通过, 更新预算已用
    if (action === 'approve') {
      const budget = db.prepare(`
        SELECT id FROM budgets WHERE status = 'active' ORDER BY year DESC LIMIT 1
      `).get() as { id: string } | undefined;

      if (budget) {
        db.prepare('UPDATE budgets SET spent = spent + ? WHERE id = ?').run(order.total, budget.id);
      }
    }
  });

  txn();
  return true;
}

/** 查询订单审批记录 */
export function getApprovalRecords(orderId: string): any[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM approval_records WHERE order_id = ? ORDER BY created_at
  `).all(orderId);
}

// ============================================================
// 预算管理
// ============================================================

/** 查询预算列表 */
export function getBudgets(year?: number): any[] {
  const db = getDb();
  const y = year || new Date().getFullYear();
  return db.prepare(`
    SELECT * FROM budgets WHERE year = ? ORDER BY department
  `).all(y);
}

/** 创建/更新预算 */
export function upsertBudget(data: {
  id?: string;
  year: number;
  department: string;
  total: number;
}): any {
  const db = getDb();
  const id = data.id || `BUD-${data.year}-${data.department}`;

  const existing = db.prepare('SELECT id FROM budgets WHERE id = ?').get(id);
  if (existing) {
    db.prepare('UPDATE budgets SET total = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(data.total, id);
  } else {
    db.prepare(`
      INSERT INTO budgets (id, year, department, total, spent, status)
      VALUES (?, ?, ?, ?, 0, 'active')
    `).run(id, data.year, data.department, data.total);
  }
  return db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
}

/** 预算执行率统计 */
export function getBudgetExecution(year?: number): any {
  const db = getDb();
  const y = year || new Date().getFullYear();
  const budgets = getBudgets(y);

  const totalBudget = budgets.reduce((sum: number, b: any) => sum + b.total, 0);
  const totalSpent = budgets.reduce((sum: number, b: any) => sum + b.spent, 0);
  const executionRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    year: y,
    totalBudget,
    totalSpent,
    executionRate,
    remaining: totalBudget - totalSpent,
    departments: budgets.map((b: any) => ({
      department: b.department,
      total: b.total,
      spent: b.spent,
      rate: b.total > 0 ? Math.round((b.spent / b.total) * 100) : 0,
    })),
  };
}

// ============================================================
// 供应商管理
// ============================================================

/** 查询全部供应商 */
export function getSuppliers(category?: string): any[] {
  const db = getDb();
  const sql = category
    ? 'SELECT * FROM suppliers WHERE category = ? ORDER BY rating DESC'
    : 'SELECT * FROM suppliers ORDER BY rating DESC';
  return category ? db.prepare(sql).all(category) : db.prepare(sql).all();
}

/** 按名称查询供应商 */
export function getSupplierByName(name: string): any | null {
  const db = getDb();
  return db.prepare('SELECT * FROM suppliers WHERE name = ?').get(name) || null;
}

/** 创建供应商 */
export function createSupplier(data: {
  name: string;
  category: string;
  contact?: string;
  phone?: string;
  rating?: number;
}): any {
  const db = getDb();
  const id = `SUP-${Date.now()}`;
  db.prepare(`
    INSERT INTO suppliers (id, name, category, contact, phone, rating, total_orders, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'active')
  `).run(id, data.name, data.category, data.contact || '', data.phone || '', data.rating || 0);
  return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
}

/** 更新供应商 */
export function updateSupplier(id: string, data: Partial<{
  name: string;
  category: string;
  contact: string;
  phone: string;
  rating: number;
  status: string;
}>): boolean {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      fields.push(`${k} = ?`);
      values.push(v);
    }
  }
  if (fields.length === 0) return false;

  values.push(id);
  const result = db.prepare(`UPDATE suppliers SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
  return result.changes > 0;
}

/** 供应商对比 (按金额/订单数/评分) */
export function compareSuppliers(): SupplierCompare[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT name, total_orders, total_amount, rating FROM suppliers
    WHERE status = 'active' ORDER BY total_amount DESC
  `).all() as { name: string; total_orders: number; total_amount: number; rating: number }[];

  return rows.map((r) => ({
    name: r.name,
    orders: r.total_orders,
    total: r.total_amount,
    avgTime: 3,
    rating: r.rating,
  }));
}
