This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker 全量自部署

项目支持 Docker 一键自部署, 使用 Next.js standalone 输出 + SQLite 持久化卷 + cron 巡检 sidecar。

### 快速启动

```bash
# 1. 准备环境变量
cp .env.example .env
# 编辑 .env, 务必修改 NEXTAUTH_SECRET (可用 openssl rand -hex 32)

# 2. 构建并启动
docker compose up -d --build

# 3. 查看日志
docker compose logs -f caixuan-ai

# 4. 访问
open http://localhost:3000
```

### 服务说明

| 服务 | 说明 |
|------|------|
| `caixuan-ai` | Next.js 应用 (standalone 模式, 端口 3000) |
| `caixuan-cron` | 价格预警定时巡检 sidecar (每 30 分钟调用 `/api/cron/price-check`) |

### 数据持久化

- SQLite 数据文件挂载到命名卷 `caixuan-data` (容器内 `/app/data/caixuan.db`)
- 容器销毁重建后数据不丢失, 除非执行 `docker compose down -v`

### 常用命令

```bash
# 停止
docker compose down

# 重建 (代码更新后)
docker compose up -d --build

# 查看健康状态
docker compose ps

# 进入容器调试
docker compose exec caixuan-ai sh

# 备份数据库
docker compose exec caixuan-ai cat /app/data/caixuan.db > backup.db
```

### 架构

```
┌─────────────────────────────────────────┐
│  Host                                   │
│  ┌──────────────┐   ┌────────────────┐  │
│  │  caixuan-ai  │◄──│  caixuan-cron  │  │
│  │  :3000       │   │  (curl loop)   │  │
│  │  Next.js     │   └────────────────┘  │
│  └──────┬───────┘                       │
│         │                               │
│    ┌────▼────┐                          │
│    │ Volume  │  caixuan-data            │
│    │ SQLite  │  /app/data/caixuan.db    │
│    └─────────┘                          │
└─────────────────────────────────────────┘
```
