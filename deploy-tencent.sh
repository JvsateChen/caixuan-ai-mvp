#!/bin/bash
# ============================================
# 采选AI MVP — 腾讯云轻量服务器一键部署脚本
# 使用方法：在腾讯云 WebShell 中粘贴运行
# ============================================

set -e

echo "===== 采选AI MVP 部署脚本 ====="
echo ""

# 1. 安装 Node.js 20
echo "[1/5] 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 PM2 进程管理
echo "[2/5] 安装 PM2..."
sudo npm install -g pm2

# 3. 克隆代码
echo "[3/5] 克隆代码..."
cd /home/ubuntu
if [ -d "caixuan-ai-mvp" ]; then
  cd caixuan-ai-mvp && git pull
  echo "   代码已更新"
else
  git clone https://github.com/JvsateChen/caixuan-ai-mvp.git
  cd caixuan-ai-mvp
  echo "   代码已克隆"
fi

# 4. 配置环境
echo "[4/5] 配置环境..."
cat > .env << 'EOF'
PORT=3000
DATA_SOURCE=mock
LLM_API_KEY=
EOF

# 5. 启动服务
echo "[5/5] 启动服务..."
pm2 delete caixuan-ai 2>/dev/null || true
pm2 start server.js --name caixuan-ai --update-env
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

# 获取公网 IP
PUBLIC_IP=$(curl -s http://metadata.tencentyun.com/latest/meta-data/public-ipv4 2>/dev/null || echo "your-server-ip")

echo ""
echo "===================================="
echo "  部署完成！"
echo "===================================="
echo ""
echo "  访问地址: http://${PUBLIC_IP}:3000"
echo "  数据分析: http://${PUBLIC_IP}:3000 (点击「数据分析」页)"
echo ""
echo "  重要：请在腾讯云控制台开放 3000 端口："
echo "  轻量应用服务器 > 服务器详情 > 防火墙 > 添加规则"
echo "  协议: TCP  端口: 3000  来源: 0.0.0.0/0"
echo ""
echo "  查看日志: pm2 logs caixuan-ai"
echo "  重启服务: pm2 restart caixuan-ai"
echo "  停止服务: pm2 stop caixuan-ai"
echo ""
