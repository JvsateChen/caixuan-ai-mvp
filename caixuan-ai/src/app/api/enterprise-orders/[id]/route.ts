/* 企业订单 — 查询/更新/审批/删除 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  updateOrderStatus,
  approveOrder,
  getApprovalRecords,
} from '@/services/enterprise';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ code: 404, message: '订单不存在' }, { status: 404 });
  }
  const approvals = getApprovalRecords(id);
  return NextResponse.json({ order, approvals });
}

/** 更新订单状态 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ code: 401, message: '请先登录' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }

  const success = updateOrderStatus(id, status);
  if (!success) {
    return NextResponse.json({ code: 404, message: '订单不存在' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
