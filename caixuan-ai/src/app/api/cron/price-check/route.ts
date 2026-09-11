/* Cron 定时价格巡检 — Vercel Cron 或外部调度器调用 */
import { NextRequest, NextResponse } from 'next/server';
import { runAlertCheck, checkMonitoringTargets } from '@/services/alertMatcher';

export async function GET(req: NextRequest) {
  // 验证 Cron 密钥
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. 检查预警触发
    const alertResults = await runAlertCheck();

    // 2. 检查监控目标达成
    const targetResults = checkMonitoringTargets();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      alertsTriggered: alertResults.length,
      targetsAchieved: targetResults.filter((t) => t.achieved).length,
      details: alertResults,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: '巡检失败' },
      { status: 500 },
    );
  }
}
