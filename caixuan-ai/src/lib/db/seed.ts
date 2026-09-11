/* ============================================================
   采选AI平台 · 数据库种子数据
   将 mockData.ts 中的数据导入 SQLite
   ============================================================ */

import type Database from 'better-sqlite3';
import { mockDataProducts, mockDataAll } from './mockDataExport';

/** 种子数据导入 */
export function seedDatabase(db: Database.Database): void {
  const seedUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, phone, nickname, role)
    VALUES ('demo-user', '13800138000', '演示用户', 'user')
  `);

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (id, name, brand, spec, category, image_type, target_price, lowest, sparkline)
    VALUES (@id, @name, @brand, @spec, @category, @image, @targetPrice, @lowest, @sparkline)
  `);

  const insertQuote = db.prepare(`
    INSERT OR IGNORE INTO product_quotes (product_id, platform, price, prev_price, trend, delta, url)
    VALUES (@productId, @name, @price, @prevPrice, @trend, @delta, @url)
  `);

  const insertTarget = db.prepare(`
    INSERT OR IGNORE INTO monitoring_targets (id, user_id, product_id, product_name, target_price, current_price, platform, status, trend, created_at)
    VALUES (@id, 'demo-user', @productId, @productName, @targetPrice, @currentPrice, @platform, @status, @trend, @createdAt)
  `);

  const insertSnapshot = db.prepare(`
    INSERT OR IGNORE INTO price_snapshots (id, product_id, product_name, platform, price, prev_price, change, trend, snapshot_at)
    VALUES (@id, @productId, @productName, @platform, @price, @prevPrice, @change, @trend, @snapshotAt)
  `);

  const insertPurchase = db.prepare(`
    INSERT OR IGNORE INTO purchase_records (id, user_id, product_id, product_name, platform, price, qty, total, status, order_date, commission)
    VALUES (@id, 'demo-user', @productId, @productName, @platform, @price, @qty, @total, @status, @orderDate, @commission)
  `);

  const insertWeekly = db.prepare(`
    INSERT OR IGNORE INTO weekly_reviews (id, user_id, week_range, total_savings, items_compared, orders_placed, commission_earned, trend, savings_change, best_deals_json)
    VALUES (@id, 'demo-user', @weekRange, @totalSavings, @itemsCompared, @ordersPlaced, @commissionEarned, @trend, @savingsChange, @bestDealsJson)
  `);

  const insertEntOrder = db.prepare(`
    INSERT OR IGNORE INTO enterprise_orders (id, title, supplier, items, total, status, date, buyer)
    VALUES (@id, @title, @supplier, @items, @total, @status, @date, @buyer)
  `);

  const insertEntStats = db.prepare(`
    INSERT OR IGNORE INTO enterprise_stats (id, monthly_spend, monthly_orders, avg_discount, suppliers, spend_categories, supplier_compare)
    VALUES (@id, @monthlySpend, @monthlyOrders, @avgDiscount, @suppliers, @spendCategories, @supplierCompare)
  `);

  const insertSearch = db.prepare(`
    INSERT OR IGNORE INTO popular_searches (term, count) VALUES (?, 0)
  `);

  const txn = db.transaction(() => {
    // 用户
    seedUser.run();

    // 商品 + 报价
    for (const p of mockDataProducts) {
      insertProduct.run({
        ...p,
        sparkline: JSON.stringify(p.sparkline),
      });
      for (const quote of p.platforms) {
        insertQuote.run({
          productId: p.id,
          ...quote,
        });
      }
    }

    // 监控目标
    for (const t of mockDataAll.monitoringTargets) {
      insertTarget.run(t);
    }

    // 价格快照
    for (const s of mockDataAll.priceSnapshots) {
      insertSnapshot.run(s);
    }

    // 采购记录
    for (const r of mockDataAll.purchaseRecords) {
      insertPurchase.run(r);
    }

    // 周报复盘
    insertWeekly.run({
      id: 'WR-001',
      weekRange: mockDataAll.weeklyReview.weekRange,
      totalSavings: mockDataAll.weeklyReview.totalSavings,
      itemsCompared: mockDataAll.weeklyReview.itemsCompared,
      ordersPlaced: mockDataAll.weeklyReview.ordersPlaced,
      commissionEarned: mockDataAll.weeklyReview.commissionEarned,
      trend: mockDataAll.weeklyReview.trend,
      savingsChange: mockDataAll.weeklyReview.savingsChange,
      bestDealsJson: JSON.stringify(mockDataAll.weeklyReview.bestDeals),
    });

    // 企业订单
    for (const o of mockDataAll.enterpriseOrders) {
      insertEntOrder.run(o);
    }

    // 企业统计
    insertEntStats.run({
      id: 'ES-001',
      monthlySpend: mockDataAll.enterpriseStats.monthlySpend,
      monthlyOrders: mockDataAll.enterpriseStats.monthlyOrders,
      avgDiscount: mockDataAll.enterpriseStats.avgDiscount,
      suppliers: mockDataAll.enterpriseStats.suppliers,
      spendCategories: JSON.stringify(mockDataAll.enterpriseStats.spendByCategory),
      supplierCompare: JSON.stringify(mockDataAll.enterpriseStats.supplierCompare),
    });

    // 热门搜索
    for (const term of mockDataAll.popularSearches) {
      insertSearch.run(term);
    }
  });

  txn();
  console.log('[DB] Seed data inserted successfully');
}
