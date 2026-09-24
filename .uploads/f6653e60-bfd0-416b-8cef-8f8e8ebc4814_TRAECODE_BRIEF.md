# 采选AI平台 — 工程开发任务

## 项目背景

基于已完成的高保真 HTML/CSS/JS 原型，开发一个跨平台智能比价 Web 应用。原型目录 `caixuan-ai-prototype/` 内含 9 个文件（7个页面 + 1个CSS + 1个JS），以及一份完整的开发交接规格文档 `DEVELOPMENT_SPEC.html`。

请**先阅读 `DEVELOPMENT_SPEC.html`**，该文档包含设计系统、数据模型、API接口、页面功能规格、组件清单和交互模式的完整定义。

## 技术栈

- 前端框架：React + TypeScript + Next.js (App Router)
- 样式：Tailwind CSS（将 `styles.css` 中的 CSS 变量映射到 `tailwind.config.ts`）
- 图表：Recharts（替换手写SVG，保持视觉一致）
- 图标：lucide-react（原型图标基于Lucide风格）
- 状态管理：Zustand
- 数据请求：TanStack Query (SWR模式，含缓存/重试/骨架屏)
- 后端：Next.js API Routes (先实现Mock API，后续对接真实后端)
- 数据库：暂用内存数据(参照 `app.js` 中的 `DB` 对象)

## 开发范围

按以下优先级分阶段实现：

### P0 — 核心流程

1. **登录页** (`login.html`)：手机号+验证码登录、微信扫码、第三方登录入口
2. **首页** (`index.html`)：AI对话比价(流式解析中间态+打字动画+迷你比价卡片)、热门商品
3. **比价结果页** (`compare.html`)：三平台比价卡片(含排序/最优价高亮/彩虹流光)、价格统计、相关推荐
4. **商品详情页** (`detail.html`)：30天价格走势图、三平台对比表、价格预警表单

### P1 — 用户中心

5. **个人中心** (`profile.html`)：比价历史、收藏夹(可删除)、价格预警(开关toggle)、个人信息
6. **我的看板** (`dashboard.html`)：监控目标表、价格快照表、采购记录表、周报复盘

### P2 — 企业功能

7. **企业采购管理台** (`admin.html`)：采购概览、支出分类柱状图、趋势折线图、供应商对比、订单表

## 关键实现要求

1. **设计系统迁移**：将 `styles.css` 的 `:root` 变量完整映射到 Tailwind 配置，保持品牌色(#4f46e5/#6366f1)、价格语义色(降#059669/升#dc2626/平#d97706)、平台色(拼多多#e02130/京东#1677ff/淘宝#ff6a00)完全一致

2. **骨架屏**：每个异步数据区域必须有 shimmer 动画骨架屏，参照原型中的 `.skeleton` 样式

3. **错误处理**：API失败时显示空状态 + Toast错误提示(含可点击的"重试"按钮)，参照 `app.js` 中 `loadData()` 和 `Toast` 的实现

4. **价格走势图**：用 Recharts 替换手写SVG，保持三平台折线+网格+轴标签+末端圆点+面积填充的视觉风格

5. **目标达成动画**：当 `lowest <= targetPrice` 时，卡片顶部显示品牌色渐变流光条(5s linear infinite) + 彩虹Badge

6. **URL参数传递**：跨页跳转需正确传递 `id`(商品ID) 和 `q`(搜索词)，使用 `encodeURIComponent`，参照路由表

7. **AI对话**：实现流式解析中间态(3步文本 → 打字动画 → 比价结果)，参照 `index.html` 中 `sendChat()` 函数

8. **组件复用**：Topbar、Toast、Skeleton、StatCard、PriceTag、Sparkline、Badge、EmptyState 等提取为共享组件

9. **响应式**：768px断点，移动端隐藏导航/侧边栏、网格变单列、表格水平滚动

10. **Mock API**：参照 `app.js` 中 `API` 对象实现 Next.js API Routes，包含 500-1100ms 延迟和 8-15% 随机失败率(开发阶段用于测试骨架屏和错误重试)

## 参考文件

| 文件 | 用途 |
|------|------|
| `DEVELOPMENT_SPEC.html` | **首先阅读** — 完整开发规格文档 |
| `styles.css` | CSS设计系统(变量/组件/动画/响应式)，直接迁移 |
| `app.js` | Mock数据(`DB`对象) + API模拟(`API`对象) + 图标库(`Icon`对象) + 工具函数(`Utils`对象) + Toast/骨架屏 |
| `index.html` | 首页交互参照(AI对话流程) |
| `compare.html` | 比价卡片+排序+骨架屏参照 |
| `detail.html` | 走势图+预警表单+面包屑参照 |
| `dashboard.html` | Tab切换+多表格+周报复盘参照 |
| `admin.html` | 企业看板+图表+侧边栏滚动参照 |
| `profile.html` | URL参数Tab激活+预警开关+收藏删除参照 |
| `login.html` | 登录表单验证+倒计时+二维码参照 |

## 交付标准

- 所有 7 个页面功能完整可交互
- 骨架屏 → API → 渲染 → 错误重试 流程完整
- 设计系统与原型视觉一致(色彩/圆角/阴影/动画)
- 响应式适配(768px断点)
- TypeScript 类型完整(参照规格文档中的数据模型)
- 组件合理拆分，可复用

## 页面路由表

| 路由 | 原型文件 | URL参数 | 说明 |
|------|---------|---------|------|
| `/` | index.html | — | AI对话首页 |
| `/compare` | compare.html | `?id=商品ID&q=搜索词` | 比价结果 |
| `/detail` | detail.html | `?id=商品ID` | 商品详情 |
| `/dashboard` | dashboard.html | — | 个人看板 |
| `/admin` | admin.html | — | 企业采购 |
| `/profile` | profile.html | `?tab=history|fav|alert|info` | 个人中心 |
| `/login` | login.html | — | 登录页 |

## 页面跳转关系

```
login → index (登录成功)
index → compare (搜索商品/AI回复中的"查看完整比价")
index → detail (点击热门商品卡片)
compare → detail (点击"设置价格预警"按钮)
compare → compare (搜索框重新搜索/相关推荐卡片)
detail → compare (面包屑"比价结果"/"返回比价"链接，带productId)
detail → detail (相关推荐卡片)
dashboard → detail (监控目标"查看详情")
dashboard → profile?tab=alert/fav/info (侧边栏工具链接)
profile → detail (比价历史/预警列表中的商品链接)
profile → login (退出登录)
所有页面 → index (Logo/导航)
所有页面 → profile (头像)
```

## 数据模型概览

- **Product** — 商品(id/name/brand/spec/category/image/platforms/targetPrice/lowest/sparkline)
- **Platform** — 平台价格(name/price/prevPrice/trend/delta/url)
- **MonitoringTarget** — 监控目标(id/productId/productName/targetPrice/currentPrice/platform/status/createdAt/trend)
- **PriceSnapshot** — 价格快照(id/productId/productName/platform/price/prevPrice/change/trend/snapshotAt)
- **PurchaseRecord** — 采购记录(id/productId/productName/platform/price/qty/total/status/orderDate/commission)
- **WeeklyReview** — 周报复盘(weekRange/totalSavings/itemsCompared/ordersPlaced/commissionEarned/bestDeals/trend/savingsChange)
- **EnterpriseOrder** — 企业订单(id/title/supplier/items/total/status/date/buyer)
- **EnterpriseStats** — 企业统计(monthlySpend/monthlyOrders/avgDiscount/suppliers/spendByCategory/supplierCompare)
- **PriceAlert** — 价格预警(id/productId/name/targetPrice/currentPrice/platform/status/enabled)
- **PriceHistory** — 价格历史(dates/platforms[]/stats{highest,lowest,avg,current})

> 完整字段定义和示例数据请参照 `DEVELOPMENT_SPEC.html` 第4节 和 `app.js` 中的 `DB` 对象。

## API 接口列表

| 方法 | 路径 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| POST | `/api/ai/chat` | `{ query: string }` | `{ query, parsed, results: Product[], total }` | AI对话比价 |
| GET | `/api/products` | — | `Product[]` | 商品列表 |
| GET | `/api/products/:id` | id | `Product` | 商品详情 |
| GET | `/api/products/:id/price-history` | id | `PriceHistory` | 30天价格历史 |
| GET | `/api/monitoring-targets` | — | `MonitoringTarget[]` | 监控目标列表 |
| GET | `/api/price-snapshots` | — | `PriceSnapshot[]` | 价格快照列表 |
| GET | `/api/purchase-records` | — | `PurchaseRecord[]` | 采购记录列表 |
| GET | `/api/weekly-review` | — | `WeeklyReview` | 周报复盘数据 |
| GET | `/api/enterprise/orders` | — | `EnterpriseOrder[]` | 企业采购订单 |
| GET | `/api/enterprise/stats` | — | `EnterpriseStats` | 企业采购统计 |
| POST | `/api/price-alerts` | `{ productId, targetPrice }` | `{ success, id }` | 设置价格预警 |

## 组件拆分建议

```
src/components/
├── shared/        # Topbar, Toast, Skeleton, StatCard, PriceTag, Sparkline, Badge, EmptyState, Sidebar
├── chat/          # ChatCard, ChatMessage, QuickPills, TypingIndicator
├── product/       # ProductCard, CompareCard, PriceChart, AlertForm
├── dashboard/     # TargetTable, SnapshotTable, PurchaseTable, ReviewPanel
├── admin/         # CategoryChart, TrendChart, SupplierTable, OrderTable
└── auth/          # LoginForm, WechatQR, ThirdPartyLogin
```
