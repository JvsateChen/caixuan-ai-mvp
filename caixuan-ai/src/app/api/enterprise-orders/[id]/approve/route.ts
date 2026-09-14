/* 订单审批 — 含权限检查 + 金额分级审批 */
import { NextRequest, NextResponse } from 'next/server';
import { approveOrder, getOrderById } from '@/services/enterprise';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission, canApproveAmount } from '@/lib/permissions';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getCurrentUser(req as any);
  const guard = requirePermission(user, 'order:approve');
  if (!guard.allowed) {
    return NextResponse.json({ code: 403, message: guard.error }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, comment } = body;

  if (!action || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }

  // 检查金额审批权限
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ code: 404, message: '订单不存在' }, { status: 404 });
  }

  if (action === 'approve' && !canApproveAmount(user, order.total)) {
    return NextResponse.json(
      { code: 403, message: `金额 ¥${order.total} 超出您的审批权限` },
      { status: 403 },
    );
  }

  const success = approveOrder(id, user!.id, user!.nickname, action, comment);
  if (!success) {
    return NextResponse.json({ code: 404, message: '订单不存在' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    status: action === 'approve' ? 'approved' : 'rejected',
  });
}
