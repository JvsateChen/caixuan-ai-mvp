/* ============================================================
   采选AI平台 · 登录页 (P0)
   手机号+验证码 / 微信扫码 / 第三方登录
   参照 login.html
   ============================================================ */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Smartphone,
  QrCode,
  Shield,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useToastStore } from '@/store/toast';
import { cx } from '@/lib/utils';

type LoginTab = 'phone' | 'wechat';

const QR_STATES = [
  '请使用微信扫一扫',
  '扫描成功,请在手机上确认',
  '登录成功,正在跳转…',
] as const;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToastStore();

  const [tab, setTab] = useState<LoginTab>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [qrState, setQrState] = useState(0);
  const [qrRefreshing, setQrRefreshing] = useState(false);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // 微信扫码状态推进
  useEffect(() => {
    if (tab !== 'wechat') return;
    setQrState(0);
    const timers = [
      setTimeout(() => setQrState(1), 2500),
      setTimeout(() => setQrState(2), 5500),
      setTimeout(() => {
        toast.success('登录成功', '欢迎回到采选AI');
        router.push('/');
      }, 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [tab, router, toast]);

  // 发送验证码
  const sendCode = () => {
    if (!/^1\d{10}$/.test(phone)) {
      toast.warning('手机号格式错误', '请输入11位手机号');
      return;
    }
    if (countdown > 0) return;
    toast.success('验证码已发送', '验证码 6 位, 5 分钟内有效');
    setCountdown(60);
  };

  // 手机号登录
  const onPhoneLogin = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      toast.warning('手机号格式错误', '请输入11位手机号');
      return;
    }
    if (code.length !== 6) {
      toast.warning('验证码错误', '请输入6位验证码');
      return;
    }
    if (!agree) {
      toast.warning('请先同意协议', '需勾选用户协议和隐私政策');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success('登录成功', '欢迎回到采选AI');
    router.push('/');
  };

  // 刷新二维码
  const refreshQr = async () => {
    setQrRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    setQrRefreshing(false);
    setQrState(0);
    toast.info('二维码已刷新', '请重新扫码');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-mark" style={{ width: 36, height: 36 }}>
              <ShoppingCart size={20} />
            </span>
            <span>采选AI</span>
          </div>
          <h1>欢迎登录</h1>
          <p>跨平台智能比价 · 让采购更精明</p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={cx('login-tab', tab === 'phone' && 'active')}
            onClick={() => setTab('phone')}
          >
            <Smartphone size={16} /> 手机号登录
          </button>
          <button
            type="button"
            className={cx('login-tab', tab === 'wechat' && 'active')}
            onClick={() => setTab('wechat')}
          >
            <QrCode size={16} /> 微信扫码
          </button>
        </div>

        {/* Body */}
        <div className="login-body">
          {tab === 'phone' ? (
            <>
              <div className="form-group">
                <label className="form-label">手机号</label>
                <div className="phone-prefix">
                  <select defaultValue="+86" aria-label="区号">
                    <option value="+86">+86</option>
                    <option value="+852">+852</option>
                    <option value="+886">+886</option>
                  </select>
                  <input
                    type="tel"
                    maxLength={11}
                    placeholder="请输入手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">验证码</label>
                <div className="code-row">
                  <input
                    className="form-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6位验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onPhoneLogin();
                    }}
                  />
                  <button
                    type="button"
                    className="code-btn"
                    disabled={countdown > 0}
                    onClick={sendCode}
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                  </button>
                </div>
              </div>
              <label className="login-agree">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  我已阅读并同意
                  <a href="#" onClick={(e) => e.preventDefault()}>《用户协议》</a>
                  和
                  <a href="#" onClick={(e) => e.preventDefault()}>《隐私政策》</a>
                </span>
              </label>
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                disabled={submitting}
                onClick={onPhoneLogin}
              >
                {submitting ? <RefreshCw size={16} className="spin" /> : <CheckCircle2 size={16} />}
                登录 / 注册
              </button>
            </>
          ) : (
            <div className="wechat-qr">
              <div className="qr-box">
                {/* 模拟二维码 (网格) */}
                <div
                  className="qr-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(21, 1fr)',
                    width: 160,
                    height: 160,
                    gap: 1,
                    padding: 4,
                  }}
                >
                  {Array.from({ length: 441 }, (_, i) => {
                    // 简单伪随机黑白格
                    const on = (i * 7 + (i % 5) * 3 + ((i >> 3) & 3)) % 3 === 0;
                    return (
                      <div
                        key={i}
                        style={{
                          background: on ? '#1e293b' : 'transparent',
                          borderRadius: 1,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="qr-scan-line" />
              </div>
              <div className="qr-status">
                <span className="flex-center gap-sm" style={{ justifyContent: 'center' }}>
                  {qrState < 2 && <span className="spinner" />}
                  {QR_STATES[qrState]}
                </span>
                {qrState === 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm mt-sm"
                    onClick={refreshQr}
                  >
                    <RefreshCw size={14} className={qrRefreshing ? 'spin' : ''} /> 刷新二维码
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="login-divider">其他登录方式</div>
          <div className="flex-center gap-md" style={{ justifyContent: 'center' }}>
            <button
              type="button"
              className="icon-btn"
              aria-label="微信登录"
              style={{ background: '#07c160', color: '#fff' }}
              onClick={() => setTab('wechat')}
            >
              <Smartphone size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="QQ登录"
              style={{ background: '#12b7f5', color: '#fff' }}
              onClick={() => toast.info('QQ登录', '即将开放,敬请期待')}
            >
              <QrCode size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="支付宝登录"
              style={{ background: '#1677ff', color: '#fff' }}
              onClick={() => toast.info('支付宝登录', '即将开放,敬请期待')}
            >
              <Shield size={18} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          登录即代表同意
          <a href="#" onClick={(e) => e.preventDefault()}>采选AI服务协议</a>
          {' '}·{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>隐私政策</a>
        </div>
      </div>
      <style>{`
        .spin { animation: spin 0.6s linear infinite; }
      `}</style>
    </div>
  );
}
