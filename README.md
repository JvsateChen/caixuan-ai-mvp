# 采选AI MVP

标品中立比价助手 —— 以 AI 对话框为唯一入口，跨 1688/淘宝/京东/拼多多聚合比价。

## 启动

```bash
node server.js
```

打开 http://localhost:3000

> 零依赖，纯 Node 内置模块，无需 npm install。

## AI 双兼容引擎

引擎模式由 `.env` 的 `LLM_API_KEY` 决定：

| 配置 | 模式 | 行为 |
|---|---|---|
| `LLM_API_KEY=`（空） | B 规则降级 | 品类词典+正则解析，无网络调用 |
| `LLM_API_KEY=sk-xxx` | A 大模型 | 调用 OpenAI 兼容接口，语义解析 |
| 大模型调用失败 | 自动降级 B | 容错，不中断服务 |

切换模式：编辑 `.env` 后重启 `node server.js`。

## 可插拔数据源

由 `.env` 的 `DATA_SOURCE` 控制（默认 mock）：

| 值 | 数据源 | 状态 |
|---|---|---|
| `mock` | 内置 mock | 可用 |
| `taobao` | 淘宝联盟 | 接入位（需填 AppKey） |
| `jd` | 京东联盟 | 接入位 |
| `pdd` | 多多进宝 | 接入位 |
| `alibaba1688` | 1688 开放平台 | 接入位 |
| `aggregate` | 第三方聚合 | 接入位 |

接入真实 API：在 `src/data-sources/stubs.js` 对应函数内实现调用，业务层零改动。

## 反馈埋点

MVP 内置轻量级行为采集系统，无需第三方依赖：

| 端点 | 方法 | 功能 |
|---|---|---|
| `/api/track` | POST | 接收前端上报的事件 |
| `/api/feedback` | POST | 提交用户反馈（类型/评分/描述/联系方式） |
| `/api/feedback` | GET | 获取反馈列表 |
| `/api/analytics` | GET | 获取埋点分析看板数据 |

自动采集事件：
- `page_view` — 页面浏览（导航切换时自动上报）
- `chat_search` — AI 对话搜索（含搜索词、结果数、解析模式）
- `view_compare` — 查看比价结果
- `view_history` — 查看历史价格
- `alert_create` — 设置降价提醒
- `feedback_submit` — 提交反馈

前端数据看板：侧边栏「数据分析」页，展示事件分布、热门搜索词、事件流、用户反馈。

## 部署

### 方案一：Docker

```bash
docker build -t caixuan-ai .
docker run -p 3000:3000 --env-file .env caixuan-ai
```

### 方案二：Railway

1. GitHub 仓库连接 Railway
2. Railway 自动检测 `railway.json`，`node server.js` 启动
3. 在 Railway 环境变量中设置 `LLM_API_KEY`、`DATA_SOURCE` 等

### 方案三：Render

1. 新建 Web Service，连接 GitHub 仓库
2. Build Command：留空（零依赖）
3. Start Command：`node server.js`
4. 环境变量中按需配置 `.env` 内容

### 方案四：Vercel（Serverless 适配）

需将 `server.js` 适配为 Vercel Functions 格式，或仅部署 `public/` 静态文件 + API 路由拆分。

### 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `PORT` | 服务端口 | 3000 |
| `LLM_API_KEY` | 大模型 API Key（留空走规则模式） | 无 |
| `LLM_BASE_URL` | 大模型 API 地址 | `https://ark.cn-beijing.volces.com/api/v3` |
| `LLM_MODEL` | 模型名称 | `doubao-pro-32k` |
| `DATA_SOURCE` | 数据源 | `mock` |

## 工程结构

```
caixuan-ai-mvp/
├── server.js                # 入口（http 服务 + .env 加载 + 静态文件 + API 路由）
├── Dockerfile                # Docker 部署
├── railway.json              # Railway 部署配置
├── .env.example              # 环境配置模板
├── src/
│   ├── ai-engine.js         # AI 双兼容引擎（模式A大模型 / 模式B规则降级）
│   ├── routes.js            # API 路由（chat/compare/history/alerts/meta/engine/track/feedback/analytics）
│   ├── db.js                # mock 数据
│   ├── tracker.js           # 埋点存储 + 用户反馈收集
│   └── data-sources/
│       ├── index.js         # 数据源调度器（统一接口 + 注册 + 切换）
│       ├── mock.js          # mock 实现
│       └── stubs.js         # 5 个联盟接入位（预留）
└── public/
    ├── index.html           # 前端骨架
    ├── styles.css           # 样式（Ant Design 风格，无渐变）
    └── app.js               # 前端逻辑（调真实 API + 埋点上报 + 反馈弹窗 + 数据看板）
```

## 产品原则

- **中立**：不按佣金排序，不导流分销链接
- **可审计**：每条价格标注来源平台、店铺、抓取时间
- **不拿佣金**：结果页只给原始链接
- 视觉：禁 emoji 图标、禁紫粉渐变、禁 AI 模板味文案
