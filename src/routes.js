// API 路由处理 —— 前端所有数据请求由此分发
const Engine = require("./ai-engine");
const DS = require("./data-sources");
const DB = require("./db");
const Tracker = require("./tracker");

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
  return true;
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", c => raw += c);
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { resolve({}); }
    });
  });
}

async function handle(req, res, url) {
  const p = url.pathname;
  const method = req.method;

  // 引擎状态（前端据此显示当前模式 A/B）
  if (p === "/api/engine" && method === "GET") {
    return send(res, 200, {
      hasKey: !!process.env.LLM_API_KEY,
      mode: process.env.LLM_API_KEY ? "A" : "B",
      source: DS.currentKey(),
      model: process.env.LLM_MODEL || "doubao-pro-32k"
    });
  }

  // 元数据（用户、平台、快捷提示、最近搜索）
  if (p === "/api/meta" && method === "GET") {
    return send(res, 200, {
      user: DB.user,
      platforms: DB.platforms,
      quickPrompts: DB.quickPrompts,
      recentSearches: DB.recentSearches
    });
  }

  // AI 对话：解析需求 + 查数据源
  if (p === "/api/chat" && method === "POST") {
    const { prompt } = await readBody(req);
    if (!prompt) return send(res, 400, { error: "缺少 prompt" });
    const parsed = await Engine.parse(prompt);
    const products = await DS.getPrice(parsed);
    Tracker.track({ event: "chat_search", page: "home", detail: { prompt, resultCount: products.length, mode: parsed.mode, category: parsed.category } });
    return send(res, 200, { parsed, products });
  }

  // 比价结果
  if (p.startsWith("/api/compare/") && method === "GET") {
    const id = p.split("/")[3];
    const product = await DS.getById(id);
    if (!product) return send(res, 404, { error: "商品不存在" });
    Tracker.track({ event: "view_compare", page: "compare", detail: { productId: id, productName: product.name } });
    return send(res, 200, { product });
  }

  // 历史价格
  if (p.startsWith("/api/history/") && method === "GET") {
    const id = p.split("/")[3];
    const product = await DS.getById(id);
    if (!product) return send(res, 404, { error: "商品不存在" });
    Tracker.track({ event: "view_history", page: "history", detail: { productId: id, productName: product.name } });
    return send(res, 200, { product, history: product.history });
  }

  // 提醒列表
  if (p === "/api/alerts" && method === "GET") {
    return send(res, 200, { alerts: DB.alerts });
  }

  // 新建提醒
  if (p === "/api/alerts" && method === "POST") {
    const { productId, targetPrice } = await readBody(req);
    const product = await DS.getById(productId);
    if (!product) return send(res, 404, { error: "商品不存在" });
    const cur = product.platforms.find(x => x.key === "1688").price;
    const alert = {
      id: "AL" + Date.now(),
      productId, productName: product.name,
      targetPrice: parseFloat(targetPrice), currentPrice: cur,
      status: parseFloat(targetPrice) >= cur ? "已触发" : "监控中",
      createdTime: new Date().toISOString().slice(0, 10)
    };
    DB.alerts.unshift(alert);
    Tracker.track({ event: "alert_create", page: "alerts", detail: { productId, productName: product.name, targetPrice: parseFloat(targetPrice), currentPrice: cur } });
    return send(res, 200, { alert });
  }

  // 删除提醒
  if (p.startsWith("/api/alerts/") && method === "DELETE") {
    const id = p.split("/")[3];
    DB.alerts = DB.alerts.filter(a => a.id !== id);
    return send(res, 200, { ok: true });
  }

  // 埋点上报
  if (p === "/api/track" && method === "POST") {
    const body = await readBody(req);
    Tracker.track(body);
    return send(res, 200, { ok: true });
  }

  // 用户反馈提交
  if (p === "/api/feedback" && method === "POST") {
    const body = await readBody(req);
    if (!body.content) return send(res, 400, { error: "请填写反馈内容" });
    const entry = Tracker.addFeedback(body);
    return send(res, 200, { ok: true, feedback: entry });
  }

  // 用户反馈列表
  if (p === "/api/feedback" && method === "GET") {
    return send(res, 200, { feedback: Tracker.getAnalytics().feedback });
  }

  // 埋点分析看板数据
  if (p === "/api/analytics" && method === "GET") {
    return send(res, 200, Tracker.getAnalytics());
  }

  // 埋点数据 CSV 导出
  if (p === "/api/analytics/export" && method === "GET") {
    const csv = Tracker.exportCSV();
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=analytics.csv"
    });
    res.end("\ufeff" + csv);
    return true;
  }

  return false;
}

module.exports = { handle };
