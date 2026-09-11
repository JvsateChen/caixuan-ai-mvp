/* ============================================================
   采选AI平台 · 数据库连接封装 (better-sqlite3)
   单例模式, 保证 Next.js 热重载时不重复创建连接
   ============================================================ */

import Database from 'better-sqlite3';
import { SCHEMA_SQL } from './schema';
import { seedDatabase } from './seed';

const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';

let db: Database.Database | null = null;

/** 获取数据库单例 */
export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // 初始化表结构
    db.exec(SCHEMA_SQL);

    // 首次运行时 seed
    const count = db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number };
    if (count.c === 0) {
      seedDatabase(db);
    }
  }
  return db;
}

/** 关闭数据库连接 (测试用) */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
