# 采选AI · 开发计划文档

> **版本**: 1.0  
> **日期**: 2026-09-11  
> **项目**: 跨平台智能比价助手 (拼多多 / 京东 / 淘宝)  
> **技术栈**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + TanStack Query + Zustand + Recharts

---

## 1. 项目现状评估

### 1.1 已完成

| 模块 | 状态 | 说明 |
|------|------|------|
| HTML 高保真原型 | ✅ 完成 | 8 个页面 + 1 份开发规格文档，位于 `caixuan-ai-prototype/` |
| Next.js 项目脚手架 | ✅ 完成 | Next 16.3.4 + React 19.2.8 + TS 5 |
| 全部 7 个页面 | ✅ 完成 | 首页 / 比价 / 详情 / 看板 / 管理台 / 个人中心 / 登录 |
| 12 个 Mock API 路由 | ✅ 完成 | 含模拟延迟与失败率，支持前端独立开发 |
| 共享组件库 | ✅ 完成 | Topbar / ProductCard / Skeleton / Toast / QueryState / Badge / Buttons / PriceTag |
| 设计系统 | ✅ 完成 | Tailwind v4 @theme 映射，品牌色 / 价格语义色 / 平台色 / 动画 |
| 状态管理 | ✅ 完成 | Zustand 收藏夹 + Toast，localStorage 持久化 |
| TypeScript 类型定义 | ✅ 完成 | 覆盖全部数据模型（219 行） |
| Mock 数据库 | ✅ 完成 | 6 个商品 + 监控目标 + 价格快照 + 采购记录 + 企业数据 |

### 1.2 待完成（从 Mock 到生产）

| 模块 | 优先级 | 说明 |
|------|--------|------|
| 真实数据库 | P0 | 替换内存 Mock，持久化商品 / 用户 / 订单 / 预警数据 |
| 用户认证系统 | P0 | 手机验证码登录 + JWT + 微信 OAuth |
| 真实比价引擎 | P0 | 三平台商品搜索与价格采集 |
| AI 对话 NLP | P0 | 自然语言意图解析 → 商品匹配 |
| 价格预警推送 | P1 | 到价通知（站内 / 微信 / 短信） |
| 定时价格巡检 | P1 | Cron 定时采集 + 快照存储 |
| 企业采购模块 | P2 | 审批流 / 预算 / 供应商管理 |
| 测试体系 | P1 | 单元 / 集成 / E2E |
| 部署与运维 | P1 | CI/CD + 监控 + 日志 |

---

## 2. 开发阶段规划

### 阶段一：P0 核心链路（MVP）

**目标**: 用户可通过 AI 对话搜索商品，获取三平台真实比价结果，设置价格预警。

#### 2.1.1 数据库设计与实现

**选型**: PostgreSQL (Supabase / 自建)

**核心表结构**:

```
products            -- 商品主表
product_quotes      -- 平台报价（一商品多平台）
price_history       -- 价格历史（按天粒度）
users               -- 用户
monitoring_targets  -- 监控目标
price_alerts        -- 价格预警设置
purchase_records    -- 采购记录
price_snapshots     -- 价格快照
weekly_reviews      -- 周报复盘
enterprise_orders   -- 企业订单
enterprise_stats    -- 企业统计（物化视图）
suppliers           -- 供应商
```

**关键索引**:
- `product_quotes(product_id, platform)` — 比价查询
- `price_history(product_id, platform, recorded_at DESC)` — 走势图
- `monitoring_targets(user_id, status)` — 看板列表
- `price_alerts(user_id, status, target_price)` — 预警匹配

**迁移策略**:
1. 使用 Prisma 或 Drizzle ORM 定义 schema
2. 将现有 `mockData.ts` 的数据结构映射为 DDL
3. 编写 seed 脚本，将 Mock 数据导入数据库
4. API 路由从 `import { db } from '@/lib/mockData'` 切换为真实 DB 查询

**交付物**:
- `prisma/schema.prisma` 或 `src/db/schema.ts`
- `src/lib/db.ts` — 数据库连接封装
- `prisma/migrations/` — 迁移文件
- `prisma/seed.ts` — 种子数据脚本

#### 2.1.2 用户认证系统

**方案**: NextAuth.js v5 (Auth.js) + 手机验证码 + 微信扫码

**实现内容**:

| 功能 | 说明 |
|------|------|
| 手机验证码 | 接入阿里云/腾讯云短信服务，6 位码，5 分钟有效 |
| JWT 会话 | NextAuth session，httpOnly cookie |
| 微信扫码 | 微信开放平台 OAuth2.0 扫码登录 |
| 路由守卫 | 中间件 `middleware.ts` 拦截未登录访问 |
| 角色权限 | C 端用户 / B 端企业管理员 |

**文件结构**:
```
src/
├── lib/auth.ts              # NextAuth 配置
├── app/api/auth/[...nextauth]/route.ts  # Auth 路由
├── app/api/sms/send/route.ts           # 发送验证码
└── middleware.ts            # 路由守卫
```

**登录页改造**:
- [page.tsx](file:///workspace/caixuan-ai/src/app/login/page.tsx) 中的模拟登录逻辑替换为真实 Auth 调用
- 验证码倒计时保留，接入真实短信 API
- 微信二维码替换为真实微信 OAuth URL

#### 2.1.3 比价引擎

**架构**: 独立采集服务 + Next.js API 路由

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  采集服务    │────▶│  价格数据库  │◀────│  API 路由   │
│ (Node/Python)│     │  PostgreSQL  │     │ (Next.js)   │
└──────┬──────┘     └──────────────┘     └──────┬──────┘
       │                                         │
  平台爬虫/API                              前端查询
  (拼多多/京东/淘宝)
```

**采集策略**:

| 平台 | 方案 | 频率 |
|------|------|------|
| 拼多多 | 开放平台 API / 搜索接口 | 实时（按需）+ 每日快照 |
| 京东 | 京东联盟 API / 商品搜索 | 实时（按需）+ 每日快照 |
| 淘宝 | 淘宝客 API / 搜索接口 | 实时（按需）+ 每日快照 |

**关键模块**:
```
src/
├── services/
│   ├── crawler/
│   │   ├── pdd.ts          # 拼多多采集
│   │   ├── jd.ts           # 京东采集
│   │   ├── taobao.ts       # 淘宝采集
│   │   └── index.ts        # 统一调度
│   ├── priceCompare.ts     # 比价逻辑（排序、最优价、趋势计算）
│   └── snapshot.ts         # 价格快照存储
└── app/api/
    ├── products/route.ts   # 改为查询真实 DB
    └── price-history/route.ts  # 改为查询真实历史
```

**降级策略**: 平台 API 不可用时返回缓存价格 + `stale` 标记

#### 2.1.4 AI 对话 NLP

**方案**: 接入大语言模型 API（豆包 / 通义千问 / OpenAI）

**实现流程**:
1. 用户输入自然语言 → LLM 解析意图（品牌、品类、规格）
2. 用解析结果查询商品数据库（模糊匹配 + 全文搜索）
3. 返回匹配商品 + 三平台报价

**API 改造**:
- [ai-chat/route.ts](file:///workspace/caixuan-ai/src/app/api/ai-chat/route.ts) 从 Mock 关键词匹配改为 LLM 调用
- 新增 `src/services/llm.ts` — LLM 客户端封装
- 新增 `src/services/productSearch.ts` — 商品搜索（PostgreSQL 全文索引 / Elasticsearch）

**Prompt 设计**:
```
你是一个商品比价助手。用户会输入商品需求，你需要解析出：
- brand: 品牌名
- category: 商品类目
- spec: 规格要求
- keywords: 搜索关键词

用户输入: "{用户输入}"
请返回 JSON 格式。
```

---

### 阶段二：P1 增值功能

**目标**: 价格预警自动推送、个人看板数据真实化、周报自动生成。

#### 2.2.1 价格预警系统

**架构**: 定时巡检 + 预警匹配 + 多渠道推送

```
┌──────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────┐
│ Cron 定时 │───▶│ 采集最新价格  │───▶│ 匹配预警规则 │───▶│ 推送通知  │
│ (每小时)  │    │ (三平台)     │    │ (target_price)│   │(站内/微信)│
└──────────┘    └──────────────┘    └────────────┘    └──────────┘
```

**实现内容**:

| 模块 | 说明 |
|------|------|
| 定时任务 | Vercel Cron Jobs / 外部调度器，每小时巡检监控目标商品 |
| 预警匹配 | 查询 `price_alerts` 表，比对当前价格 ≤ 目标价 |
| 站内通知 | 写入 `notifications` 表，前端轮询 / SSE 推送 |
| 微信通知 | 微信公众号模板消息 / 小程序订阅消息 |
| 短信通知 | 阿里云短信（仅高价值商品预警） |

**文件结构**:
```
src/
├── app/api/cron/price-check/route.ts  # 定时巡检入口
├── services/
│   ├── alertMatcher.ts               # 预警匹配引擎
│   └── notifier/
│       ├── inApp.ts                  # 站内通知
│       ├── wechat.ts                 # 微信推送
│       └── sms.ts                    # 短信推送
└── app/api/notifications/route.ts    # 通知列表 API
```

#### 2.2.2 看板数据真实化

**改造点**:

| 页面 | 改造内容 |
|------|----------|
| [dashboard/page.tsx](file:///workspace/caixuan-ai/src/app/dashboard/page.tsx) | 四个 Tab 数据从 Mock API 切换为用户维度真实查询 |
| 监控目标 | 查询当前用户的 `monitoring_targets` + JOIN `products` |
| 价格快照 | 查询用户关注商品的 `price_snapshots`，按时间倒序 |
| 采购记录 | 查询用户的 `purchase_records`，支持分页 |
| 周报复盘 | 定时任务每周日生成，写入 `weekly_reviews` 表 |

**新增 API**:
- `GET /api/notifications` — 站内通知列表
- `POST /api/monitoring-targets` — 创建监控目标
- `DELETE /api/monitoring-targets/[id]` — 删除监控目标
- `GET /api/dashboard/summary` — 看板汇总数据（减少请求数）

#### 2.2.3 测试体系

**分层策略**:

| 层级 | 工具 | 覆盖范围 |
|------|------|----------|
| 单元测试 | Vitest | 工具函数 / 状态管理 / 比价逻辑 |
| 集成测试 | Vitest + Testing Library | 组件渲染 / API 路由 / DB 查询 |
| E2E 测试 | Playwright | 核心用户流程（搜索→比价→详情→预警） |
| API 测试 | Vitest + supertest | 所有 API 路由 |

**测试文件结构**:
```
tests/
├── unit/
│   ├── utils.test.ts
│   ├── priceCompare.test.ts
│   └── store.test.ts
├── integration/
│   ├── api/
│   │   ├── ai-chat.test.ts
│   │   ├── products.test.ts
│   │   └── price-alert.test.ts
│   └── components/
│       ├── ProductCard.test.tsx
│       └── QueryState.test.tsx
└── e2e/
    ├── search-compare.spec.ts
    ├── detail-alert.spec.ts
    └── auth-flow.spec.ts
```

**覆盖率目标**: 核心逻辑 ≥ 80%，UI 组件 ≥ 60%

---

### 阶段三：P2 企业级功能

**目标**: 企业采购全流程管理、供应商对比、支出分析。

#### 2.3.1 企业采购模块

| 功能 | 说明 |
|------|------|
| 采购概览 | 实时统计月度支出、订单数、平均折扣率 |
| 订单管理 | 创建 / 审批 / 完成全流程，支持多级审批 |
| 供应商管理 | 供应商档案、评分、合作历史 |
| 支出分析 | 按类目 / 部门 / 时间维度交叉分析 |
| 预算管理 | 年度预算设置、执行率监控、超支预警 |
| 审批中心 | 待审批列表、批量审批、审批记录 |

**新增页面**:
```
src/app/admin/
├── page.tsx              # 采购概览（已有，需接入真实数据）
├── orders/page.tsx       # 订单管理
├── suppliers/page.tsx    # 供应商管理
├── approvals/page.tsx    # 审批中心
├── analytics/page.tsx    # 数据分析
└── budget/page.tsx       # 预算管理
```

**侧边栏激活**: [admin/page.tsx](file:///workspace/caixuan-ai/src/app/admin/page.tsx) 中侧边栏目前为静态列表，需改为路由导航 + active 高亮

#### 2.3.2 企业权限体系

| 角色 | 权限 |
|------|------|
| 超级管理员 | 全部功能 + 企业设置 + 成员管理 |
| 采购经理 | 审批订单 + 预算管理 + 供应商管理 |
| 采购员 | 创建订单 + 查看比价 |
| 财务 | 查看支出分析 + 预算执行 |

**实现**: 在 `middleware.ts` 中增加角色判断，数据库增加 `enterprise_members` 表

---

## 3. 技术架构演进

### 3.1 当前架构（Mock 阶段）

```
Browser ──▶ Next.js (API Routes + Mock DB in memory)
```

### 3.2 P0 目标架构

```
Browser ──▶ Next.js (API Routes) ──▶ PostgreSQL
                    │
                    ├──▶ LLM API (AI对话解析)
                    └──▶ 平台采集服务 ──▶ 拼多多/京东/淘宝 API
```

### 3.3 P1/P2 目标架构

```
Browser ──▶ Next.js (API Routes) ──▶ PostgreSQL
                    │                       │
                    ├──▶ LLM API            ├── Redis (缓存/队列)
                    ├──▶ 平台采集服务        ├── Elasticsearch (全文搜索)
                    ├──▶ 消息推送服务        └── 对象存储 (商品图片)
                    └──▶ Cron 调度器
```

### 3.4 新增依赖规划

| 包名 | 用途 | 阶段 |
|------|------|------|
| `@prisma/client` + `prisma` | ORM | P0 |
| `next-auth` | 认证 | P0 |
| `redis` / `ioredis` | 缓存 / 队列 | P1 |
| `@upstash/redis` | Serverless Redis | P1 |
| `node-cron` 或 Vercel Cron | 定时任务 | P1 |
| `vitest` + `@testing-library/react` | 测试 | P1 |
| `@playwright/test` | E2E 测试 | P1 |
| `zod` | 请求参数校验 | P0 |
| `bull` / `bullmq` | 任务队列（采集） | P1 |

---

## 4. API 路由改造清单

### 4.1 P0 改造（Mock → 真实 DB）

| 路由文件 | 当前实现 | 改造内容 |
|----------|----------|----------|
| [ai-chat/route.ts](file:///workspace/caixuan-ai/src/app/api/ai-chat/route.ts) | Mock 关键词匹配 | → LLM 解析 + DB 全文搜索 |
| [products/route.ts](file:///workspace/caixuan-ai/src/app/api/products/route.ts) | 返回 Mock 数组 | → DB 查询，支持分页 / 筛选 |
| [products/[id]/route.ts](file:///workspace/caixuan-ai/src/app/api/products/[id]/route.ts) | Mock find | → DB 查询 + JOIN 报价表 |
| [price-history/route.ts](file:///workspace/caixuan-ai/src/app/api/price-history/route.ts) | sparkline + 随机扰动 | → DB 真实历史数据查询 |
| [price-alert/route.ts](file:///workspace/caixuan-ai/src/app/api/price-alert/route.ts) | 返回固定成功 | → 写入 alerts 表 + 用户鉴权 |
| [login/page.tsx](file:///workspace/caixuan-ai/src/app/login/page.tsx) | 模拟登录 | → NextAuth + 短信验证码 |

### 4.2 P0 新增 API

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 认证 |
| `/api/sms/send` | POST | 发送验证码 |
| `/api/crawler/search` | POST | 触发平台商品搜索采集 |
| `/api/products/search` | GET | 全文搜索商品 |

### 4.3 P1 新增 API

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/cron/price-check` | GET | Cron 定时价格巡检 |
| `/api/notifications` | GET | 站内通知列表 |
| `/api/notifications/[id]/read` | PATCH | 标记已读 |
| `/api/monitoring-targets` | POST | 创建监控目标 |
| `/api/monitoring-targets/[id]` | DELETE | 删除监控目标 |
| `/api/dashboard/summary` | GET | 看板汇总（减少请求） |
| `/api/weekly-review/generate` | POST | 手动触发生成周报 |

### 4.4 P2 新增 API

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/enterprise/orders` | POST | 创建企业订单 |
| `/api/enterprise/orders/[id]` | PATCH | 更新订单状态 |
| `/api/enterprise/orders/[id]/approve` | POST | 审批订单 |
| `/api/enterprise/suppliers` | GET/POST | 供应商管理 |
| `/api/enterprise/budget` | GET/POST | 预算管理 |
| `/api/enterprise/analytics` | GET | 支出分析 |

---

## 5. 前端改造清单

### 5.1 P0 改造

| 文件 | 改造内容 |
|------|----------|
| [api.ts](file:///workspace/caixuan-ai/src/lib/api.ts) | 增加 POST/PUT/DELETE 方法封装，增加 auth header |
| [apiHelpers.ts](file:///workspace/caixuan-ai/src/lib/apiHelpers.ts) | 移除 mockApi，替换为真实 DB 查询辅助 |
| [mockData.ts](file:///workspace/caixuan-ai/src/lib/mockData.ts) | 仅保留为 seed 脚本数据源，运行时不再 import |
| [favorites.ts](file:///workspace/caixuan-ai/src/store/favorites.ts) | 收藏列表从 localStorage 迁移到 DB（登录用户） |
| [login/page.tsx](file:///workspace/caixuan-ai/src/app/login/page.tsx) | 接入 NextAuth，真实验证码发送 |
| [page.tsx](file:///workspace/caixuan-ai/src/app/page.tsx) | AI 对话接入真实 LLM API |
| [compare/page.tsx](file:///workspace/caixuan-ai/src/app/compare/page.tsx) | 比价数据从真实 API 获取，支持 URL 参数搜索 |
| [detail/page.tsx](file:///workspace/caixuan-ai/src/app/detail/page.tsx) | 价格走势图从真实 history API 获取 |

### 5.2 通用改造

| 项目 | 说明 |
|------|------|
| 分页组件 | 商品列表、订单列表等需分页，新增 `Pagination` 组件 |
| 筛选器 | 比价页增加平台筛选 / 价格区间 / 品类筛选 |
| 错误边界 | 全局 `error.tsx` + `not-found.tsx` |
| 加载策略 | 首页热门商品改为 SSR（SEO 友好），其他保持 CSR |
| 图片优化 | `next/image` 替代 Unsplash 占位图，接入 CDN |
| 响应式 | 768px 断点适配，Topbar 隐藏导航 → 抽屉菜单 |

---

## 6. 数据库 Schema 设计（核心表）

```sql
-- 用户
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       VARCHAR(11) UNIQUE,
  wechat_id   VARCHAR(64) UNIQUE,
  nickname    VARCHAR(64),
  avatar      VARCHAR(256),
  role        VARCHAR(20) DEFAULT 'user',  -- user | enterprise_admin | buyer | finance
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 商品
CREATE TABLE products (
  id          VARCHAR(20) PRIMARY KEY,      -- P001
  name        VARCHAR(200) NOT NULL,
  brand       VARCHAR(64),
  spec        VARCHAR(200),
  category    VARCHAR(50),                  -- 3C数码 | 美妆护肤 | 日用百货
  image_url   VARCHAR(256),
  target_price DECIMAL(10,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
-- 全文搜索索引
CREATE INDEX idx_products_fts ON products USING gin(to_tsvector('simple', name || ' ' || brand || ' ' || spec));

-- 平台报价
CREATE TABLE product_quotes (
  id          BIGSERIAL PRIMARY KEY,
  product_id  VARCHAR(20) REFERENCES products(id),
  platform    VARCHAR(20) NOT NULL,        -- 拼多多 | 京东 | 淘宝
  price       DECIMAL(10,2) NOT NULL,
  prev_price  DECIMAL(10,2),
  trend       VARCHAR(10),                 -- down | up | flat
  delta       DECIMAL(10,2),
  url         VARCHAR(512),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, platform)
);

-- 价格历史（按天）
CREATE TABLE price_history (
  id          BIGSERIAL PRIMARY KEY,
  product_id  VARCHAR(20) REFERENCES products(id),
  platform    VARCHAR(20) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  recorded_at DATE NOT NULL,
  UNIQUE(product_id, platform, recorded_at)
);
CREATE INDEX idx_history_product ON price_history(product_id, platform, recorded_at DESC);

-- 价格预警
CREATE TABLE price_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  product_id  VARCHAR(20) REFERENCES products(id),
  target_price DECIMAL(10,2) NOT NULL,
  status      VARCHAR(20) DEFAULT 'active', -- active | triggered | cancelled
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  triggered_at TIMESTAMPTZ
);

-- 监控目标
CREATE TABLE monitoring_targets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  product_id  VARCHAR(20) REFERENCES products(id),
  target_price DECIMAL(10,2) NOT NULL,
  status      VARCHAR(20) DEFAULT 'monitoring', -- monitoring | achieved
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 站内通知
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  type        VARCHAR(20),                 -- price_alert | system | order
  title       VARCHAR(200),
  message     TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. 部署与运维

### 7.1 部署方案

| 方案 | 适用阶段 | 说明 |
|------|----------|------|
| Vercel | P0 | Next.js 原生部署，免费额度足够 MVP |
| Vercel + Supabase | P0-P1 | DB 用 Supabase 托管 PostgreSQL |
| 独立服务器 | P1-P2 | 采集服务需长时运行，Vercel 函数有超时限制 |
| Docker Compose | P2 | 全套自部署（Next.js + PG + Redis + 采集服务） |

### 7.2 环境配置

```env
# .env.local
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# 短信
SMS_API_KEY=...
SMS_API_SECRET=...

# 微信
WECHAT_APP_ID=...
WECHAT_APP_SECRET=...

# LLM
LLM_API_KEY=...
LLM_API_BASE=https://...

# 平台采集
PDD_API_KEY=...
JD_API_KEY=...
TAOBAO_API_KEY=...

# Redis (P1+)
REDIS_URL=redis://...

# Cron (Vercel)
CRON_SECRET=...
```

### 7.3 CI/CD 流程

```
GitHub Push
    │
    ├──▶ ESLint + TypeScript 类型检查
    ├──▶ Vitest 单元测试
    ├──▶ Next.js Build
    └──▶ Vercel 部署 (preview → production)
```

### 7.4 监控

| 项目 | 工具 | 说明 |
|------|------|------|
| 错误监控 | Sentry | 前端 + API 错误捕获 |
| 性能监控 | Vercel Analytics | Web Vitals |
| 日志 | Vercel Logs / 自建 ELK | API 请求日志 |
| 采集监控 | 自建 Dashboard | 各平台采集成功率 / 延迟 |

---

## 8. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 平台 API 限流/封禁 | 采集失败 | 多账号轮换 + 降级返回缓存价格 |
| LLM 响应延迟 | AI 对话慢 | 流式返回 + 超时 3s 降级为关键词搜索 |
| 价格数据准确性 | 误导用户 | 标注数据来源时间 + 免责声明 |
| 微信审核 | 登录受限 | 备选手机号登录作为主入口 |
| 并发采集压力 | 服务器过载 | 队列控制 + Redis 限流 |

---

## 9. 开发优先级汇总

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| **P0-1** | Prisma schema + 数据库初始化 + seed | 最高 |
| **P0-2** | NextAuth 认证 + 短信验证码 | 最高 |
| **P0-3** | 三平台采集服务 + 比价引擎 | 最高 |
| **P0-4** | AI 对话接入 LLM + 商品全文搜索 | 最高 |
| **P0-5** | API 路由从 Mock 切换为真实 DB | 最高 |
| **P0-6** | 前端页面适配真实 API（分页/筛选/鉴权） | 最高 |
| **P1-1** | 价格预警定时巡检 + 多渠道推送 | 高 |
| **P1-2** | 看板数据真实化 + 周报自动生成 | 高 |
| **P1-3** | 测试体系搭建（单元 + 集成 + E2E） | 高 |
| **P1-4** | CI/CD + 错误监控 + 性能监控 | 高 |
| **P2-1** | 企业采购全流程（订单/审批/供应商/预算） | 中 |
| **P2-2** | 企业权限体系 + 数据分析 | 中 |
| **P2-3** | Docker 全量自部署 | 中 |

---

## 10. 文件结构规划（完整版）

```
caixuan-ai/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx         # 登录
│   │   ├── (main)/
│   │   │   ├── page.tsx                  # 首页 AI 对话
│   │   │   ├── compare/page.tsx          # 比价结果
│   │   │   ├── detail/page.tsx           # 商品详情
│   │   │   ├── dashboard/page.tsx        # 个人看板
│   │   │   └── profile/page.tsx         # 个人中心
│   │   ├── admin/
│   │   │   ├── page.tsx                  # 采购概览
│   │   │   ├── orders/page.tsx           # 订单管理
│   │   │   ├── suppliers/page.tsx       # 供应商
│   │   │   ├── approvals/page.tsx       # 审批中心
│   │   │   ├── analytics/page.tsx       # 数据分析
│   │   │   └── budget/page.tsx          # 预算管理
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── sms/send/route.ts
│   │   │   ├── ai-chat/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── products/[id]/route.ts
│   │   │   ├── products/search/route.ts
│   │   │   ├── price-history/route.ts
│   │   │   ├── price-alert/route.ts
│   │   │   ├── monitoring-targets/route.ts
│   │   │   ├── monitoring-targets/[id]/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── cron/price-check/route.ts
│   │   │   ├── crawler/search/route.ts
│   │   │   ├── dashboard/summary/route.ts
│   │   │   ├── weekly-review/route.ts
│   │   │   ├── enterprise-orders/route.ts
│   │   │   ├── enterprise-orders/[id]/route.ts
│   │   │   ├── enterprise-stats/route.ts
│   │   │   ├── enterprise/suppliers/route.ts
│   │   │   └── enterprise/budget/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── error.tsx                     # 全局错误边界
│   │   └── not-found.tsx
│   ├── components/                       # 已有 + 扩展
│   │   ├── ... (现有组件)
│   │   ├── Pagination.tsx               # 分页
│   │   ├── FilterBar.tsx                # 筛选器
│   │   └── NotificationBell.tsx         # 通知铃铛
│   ├── lib/
│   │   ├── db.ts                        # Prisma 客户端
│   │   ├── auth.ts                      # NextAuth 配置
│   │   ├── api.ts                       # 前端 API（扩展 POST/PUT/DELETE）
│   │   ├── types.ts                     # 类型定义（扩展）
│   │   └── utils.ts                     # 工具函数
│   ├── services/
│   │   ├── llm.ts                       # LLM 调用
│   │   ├── productSearch.ts             # 商品搜索
│   │   ├── priceCompare.ts              # 比价逻辑
│   │   ├── snapshot.ts                  # 价格快照
│   │   ├── alertMatcher.ts              # 预警匹配
│   │   ├── crawler/
│   │   │   ├── pdd.ts
│   │   │   ├── jd.ts
│   │   │   ├── taobao.ts
│   │   │   └── index.ts
│   │   └── notifier/
│   │       ├── inApp.ts
│   │       ├── wechat.ts
│   │       └── sms.ts
│   ├── store/
│   │   ├── favorites.ts                 # 改造为 DB 同步
│   │   ├── toast.ts
│   │   └── user.ts                      # 新增：用户状态
│   └── middleware.ts                    # 路由守卫
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── Dockerfile
├── docker-compose.yml                   # P2 阶段
└── package.json
```

---

## 附录：关键决策记录

| 决策项 | 选择 | 理由 |
|--------|------|------|
| ORM | Prisma | TypeScript 原生支持，迁移工具完善 |
| 认证 | NextAuth.js v5 | Next.js 生态首选，支持多 provider |
| 缓存 | Upstash Redis | Serverless 兼容，免费额度 |
| LLM | 豆包 API | 中文理解强，国内访问稳定 |
| 搜索 | PostgreSQL FTS (→ Elasticsearch) | 初期 FTS 够用，量大后迁移 ES |
| 部署 | Vercel → Docker | 初期快速上线，后期独立部署 |
| 采集 | 独立 Node 服务 | 长时运行 + 重试 + 队列 |
