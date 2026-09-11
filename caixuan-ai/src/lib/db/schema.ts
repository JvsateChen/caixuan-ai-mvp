/* ============================================================
   采选AI平台 · 数据库 Schema (SQLite DDL)
   开发环境: SQLite | 生产环境: 可迁移至 PostgreSQL
   ============================================================ */

export const SCHEMA_SQL = `
-- 用户
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  phone        TEXT UNIQUE,
  wechat_id    TEXT UNIQUE,
  nickname     TEXT,
  avatar       TEXT,
  role         TEXT DEFAULT 'user',
  enterprise_id TEXT,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

-- 商品
CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  brand         TEXT,
  spec          TEXT,
  category      TEXT,
  image_url     TEXT,
  image_type    TEXT,
  target_price  REAL,
  lowest        REAL,
  sparkline     TEXT,  -- JSON array
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 平台报价
CREATE TABLE IF NOT EXISTS product_quotes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  TEXT NOT NULL,
  platform    TEXT NOT NULL,
  price       REAL NOT NULL,
  prev_price  REAL,
  trend       TEXT,
  delta       REAL,
  url         TEXT,
  updated_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(product_id, platform)
);
CREATE INDEX IF NOT EXISTS idx_quotes_product_platform ON product_quotes(product_id, platform);

-- 价格历史 (按天)
CREATE TABLE IF NOT EXISTS price_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  TEXT NOT NULL,
  platform    TEXT NOT NULL,
  price       REAL NOT NULL,
  recorded_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(product_id, platform, recorded_at)
);
CREATE INDEX IF NOT EXISTS idx_history_product ON price_history(product_id, platform, recorded_at DESC);

-- 价格快照
CREATE TABLE IF NOT EXISTS price_snapshots (
  id           TEXT PRIMARY KEY,
  product_id   TEXT NOT NULL,
  product_name TEXT,
  platform    TEXT,
  price       REAL,
  prev_price  REAL,
  change      REAL,
  trend       TEXT,
  snapshot_at TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_snapshots_product ON price_snapshots(product_id);

-- 监控目标
CREATE TABLE IF NOT EXISTS monitoring_targets (
  id            TEXT PRIMARY KEY,
  user_id       TEXT,
  product_id    TEXT NOT NULL,
  product_name  TEXT,
  target_price  REAL,
  current_price REAL,
  platform      TEXT,
  status        TEXT DEFAULT 'monitoring',
  trend         TEXT,
  created_at    TEXT,
  updated_at    TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE INDEX IF NOT EXISTS idx_targets_user_status ON monitoring_targets(user_id, status);

-- 价格预警
CREATE TABLE IF NOT EXISTS price_alerts (
  id           TEXT PRIMARY KEY,
  user_id      TEXT,
  product_id   TEXT NOT NULL,
  target_price REAL NOT NULL,
  status       TEXT DEFAULT 'active',
  created_at   TEXT DEFAULT (datetime('now')),
  triggered_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE INDEX IF NOT EXISTS idx_alerts_user_status ON price_alerts(user_id, status);

-- 采购记录
CREATE TABLE IF NOT EXISTS purchase_records (
  id           TEXT PRIMARY KEY,
  user_id      TEXT,
  product_id   TEXT,
  product_name TEXT,
  platform     TEXT,
  price        REAL,
  qty          INTEGER DEFAULT 1,
  total        REAL,
  status       TEXT DEFAULT 'completed',
  order_date   TEXT,
  commission   REAL DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchase_records(user_id);

-- 周报复盘
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id               TEXT PRIMARY KEY,
  user_id          TEXT,
  week_range       TEXT,
  total_savings    REAL,
  items_compared   INTEGER,
  orders_placed    INTEGER,
  commission_earned REAL,
  trend            TEXT,
  savings_change   REAL,
  best_deals_json  TEXT,
  created_at       TEXT DEFAULT (datetime('now'))
);

-- 企业订单
CREATE TABLE IF NOT EXISTS enterprise_orders (
  id        TEXT PRIMARY KEY,
  title     TEXT,
  supplier  TEXT,
  items     INTEGER,
  total     REAL,
  status    TEXT DEFAULT 'pending',
  date      TEXT,
  buyer     TEXT,
  buyer_id  TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ent_orders_status ON enterprise_orders(status);

-- 企业统计
CREATE TABLE IF NOT EXISTS enterprise_stats (
  id               TEXT PRIMARY KEY,
  monthly_spend    REAL,
  monthly_orders   INTEGER,
  avg_discount     REAL,
  suppliers        INTEGER,
  spend_categories TEXT,  -- JSON
  supplier_compare TEXT,   -- JSON
  created_at       TEXT DEFAULT (datetime('now'))
);

-- 站内通知
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  type       TEXT,
  title      TEXT,
  message    TEXT,
  is_read    INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 热门搜索
CREATE TABLE IF NOT EXISTS popular_searches (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  term  TEXT UNIQUE,
  count INTEGER DEFAULT 0
);

-- 验证码 (临时, 5分钟过期)
CREATE TABLE IF NOT EXISTS verification_codes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  phone      TEXT NOT NULL,
  code       TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_codes_phone ON verification_codes(phone, expires_at);
`;
