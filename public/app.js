/* 采选AI 前端逻辑 —— 调真实后端 API，不再内联数据 */
const ICONS = {
  "message-square":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  "scale":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
  "trending":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  "bell":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.536 18 8A6 6 0 0 0 6 8c0 4.536-1.409 5.956-2.738 7.326"/></svg>',
  "search":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  "send":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .837.35l.5-.5a.5.5 0 0 0 .148-.346V5.5a.5.5 0 0 0-.5-.5h-1.5a.5.5 0 0 0-.5.5v15.977a.5.5 0 0 0 .35.488z"/><path d="M21.5 12.5 9 7.5l2.5 5-2.5 5 12.5-5z"/></svg>',
  "chevron-right":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  "arrow-left":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  "external-link":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  "shield":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 4.96-3.72 9.84-7.82 11.18a.68.68 0 0 1-.36 0C7.72 22.84 4 17.96 4 13V6a1 1 0 0 1 .5-.87l7-4a1 1 0 0 1 1 0l7 4A1 1 0 0 1 20 6Z"/><path d="m9 12 2 2 4-4"/></svg>',
  "plus":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>'
};

const state = {
  view: "home",
  currentProductId: "P001",
  meta: null,
  engine: null,
  sessionId: "S" + Date.now() + Math.random().toString(36).slice(2, 6),
  chatHistory: [{ role: "ai", text: "输入采购需求开始。例如：帮我找500个不锈钢保温杯，预算每个10元以内。", time: "刚刚" }]
};

function track(event, detail) {
  const payload = { event, page: state.view, detail: { ...detail, sessionId: state.sessionId } };
  fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
}

const api = {
  meta: () => fetch("/api/meta").then(r => r.json()),
  engine: () => fetch("/api/engine").then(r => r.json()),
  chat: (prompt) => fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }).then(r => r.json()),
  compare: (id) => fetch(`/api/compare/${id}`).then(r => r.json()),
  history: (id) => fetch(`/api/history/${id}`).then(r => r.json()),
  alerts: () => fetch("/api/alerts").then(r => r.json()),
  addAlert: (productId, targetPrice) => fetch("/api/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, targetPrice }) }).then(r => r.json()),
  deleteAlert: (id) => fetch(`/api/alerts/${id}`, { method: "DELETE" }).then(r => r.json()),
  analytics: () => fetch("/api/analytics").then(r => r.json()),
  feedback: (body) => fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
};

function getAppShell(pageKey) {
  const items = [
    { key: "home", label: "AI 找货", icon: "message-square" },
    { key: "compare", label: "比价结果", icon: "scale" },
    { key: "history", label: "历史价格", icon: "trending" },
    { key: "alerts", label: "我的提醒", icon: "bell" },
    { key: "analytics", label: "数据分析", icon: "shield" }
  ];
  const nav = items.map(it => `<a class="nav-item ${it.key === pageKey ? "active" : ""}" data-nav="${it.key}">${ICONS[it.icon]}<span>${it.label}</span></a>`).join("");
  const u = state.meta ? state.meta.user : { avatar: "", name: "", role: "" };
  return `<div class="app-nav">
    <div class="logo"><div class="logo-icon">采</div><span class="logo-text">采选AI</span></div>
    <div class="nav-list"><div class="nav-section">主导航</div>${nav}</div>
    <div class="nav-footer"><div class="user-card"><div class="user-avatar">${u.avatar || "用"}</div><div class="user-info"><div class="user-name">${u.name || ""}</div><div class="user-role">${u.role || ""}</div></div></div><button class="btn btn-sm" style="width:100%;margin-top:12px;justify-content:center" onclick="openFeedbackModal()">${ICONS["plus"]}<span>提交反馈</span></button></div>
  </div>`;
}

function headerHTML(title) {
  const e = state.engine || {};
  const modeTag = e.mode === "A"
    ? `<span class="tag tag-primary">模式A · 大模型${e.model ? " " + e.model : ""}</span>`
    : `<span class="tag tag-warning">模式B · 规则降级</span>`;
  return `<div class="app-header"><span class="header-title">${title}</span><div class="header-actions">${modeTag}<span class="tag tag-default">数据源：${e.source || "mock"}</span></div></div>`;
}

function loading() { return `<div class="loading-block">加载中…</div>`; }

function navTo(view, productId) {
  state.view = view;
  if (productId) state.currentProductId = productId;
  track("page_view", { view });
  render();
  window.scrollTo(0, 0);
}

function render() {
  const shell = document.getElementById("app-shell");
  const titleMap = { home: "采选AI · 标品中立比价", compare: "比价结果", history: "历史价格", alerts: "我的提醒", analytics: "数据分析" };
  shell.innerHTML = getAppShell(state.view) + `<div class="app-content">${headerHTML(titleMap[state.view])}<div id="view-content" class="app-body fade-in">${loading()}</div></div>`;
  document.querySelectorAll("[data-nav]").forEach(el => { el.onclick = () => navTo(el.dataset.nav); });
  loadView();
}

async function loadView() {
  const el = document.getElementById("view-content");
  try {
    if (state.view === "home") el.innerHTML = viewHome();
    else if (state.view === "compare") { el.innerHTML = loading(); el.innerHTML = viewCompare(await api.compare(state.currentProductId)); }
    else if (state.view === "history") { el.innerHTML = loading(); el.innerHTML = viewHistory(await api.history(state.currentProductId)); }
    else if (state.view === "alerts") { el.innerHTML = loading(); el.innerHTML = viewAlerts(await api.alerts()); }
    else if (state.view === "analytics") { el.innerHTML = loading(); el.innerHTML = viewAnalytics(await api.analytics()); }
  } catch (e) {
    el.innerHTML = `<div class="loading-block">加载失败：${e.message}</div>`;
  }
}

/* ===== 视图1：AI 找货 ===== */
function viewHome() {
  const m = state.meta || { quickPrompts: [], recentSearches: [], user: { stats: {} } };
  const s = m.user.stats || {};
  return `
    <div style="text-align:center;margin-bottom:var(--spacing-6)">
      <h1 style="font-size:var(--fs-24);font-weight:700;margin-bottom:var(--spacing-2)">一句话找货，自动货比四家</h1>
      <p style="color:var(--color-text-sub);font-size:var(--fs-14)">输入采购需求，AI 解析后跨 1688 / 淘宝 / 京东 / 拼多多聚合比价。数据可审计，不拿佣金。</p>
    </div>
    <div class="card" style="margin-bottom:var(--spacing-5);max-width:840px;margin-left:auto;margin-right:auto">
      <div class="card-body" style="padding:0">
        <div class="chat-container" id="chat-container">
          ${state.chatHistory.map(msg => `<div class="chat-msg ${msg.role}"><div class="chat-avatar ${msg.role}">${msg.role === "ai" ? "AI" : (m.user.avatar || "我")}</div><div><div class="chat-bubble">${msg.bubble || msg.text}</div>${msg.extra || ""}<div class="chat-time">${msg.time}</div></div></div>`).join("")}
        </div>
        <div style="padding:var(--spacing-4);border-top:1px solid var(--color-border-light)">
          <div style="display:flex;flex-wrap:wrap;gap:var(--spacing-2);margin-bottom:var(--spacing-3)">
            ${(m.quickPrompts || []).map(p => `<span class="chip" onclick="fillPrompt(${escapeAttr(p)})">${p}</span>`).join("")}
          </div>
          <div class="search-bar" style="border-radius:var(--radius-md);padding:var(--spacing-2) var(--spacing-3)">
            <input type="text" id="chat-input" placeholder="描述采购需求，如：帮我找500个不锈钢保温杯，预算每个10元以内" onkeypress="if(event.key==='Enter')sendPrompt()">
            <button class="btn btn-primary" onclick="sendPrompt()">${ICONS["send"]}<span>发送</span></button>
          </div>
        </div>
      </div>
    </div>
    <div style="max-width:840px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-4)">
      <div class="card">
        <div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">最近搜索</span></div>
        <div class="card-body" style="padding:var(--spacing-3)">
          ${(m.recentSearches || []).map(s => `<div style="display:flex;align-items:center;gap:var(--spacing-3);padding:var(--spacing-2) 0;border-bottom:1px solid var(--color-border-light);cursor:pointer" onclick="fillPrompt(${escapeAttr(s)});document.getElementById('chat-input').focus()"><span style="color:var(--color-text-disabled)">${ICONS["search"]}</span><span style="flex:1;font-size:var(--fs-13)">${s}</span><span style="color:var(--color-text-disabled)">${ICONS["chevron-right"]}</span></div>`).join("")}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">采购概览</span></div>
        <div class="card-body" style="padding:var(--spacing-4)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-3)">
            <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">累计采购</div><div style="font-size:var(--fs-20);font-weight:700">${s.totalOrders || 0}<span style="font-size:var(--fs-12);font-weight:400;color:var(--color-text-sub)">单</span></div></div>
            <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">累计支出</div><div style="font-size:var(--fs-20);font-weight:700">¥${((s.totalSpent || 0) / 10000).toFixed(1)}<span style="font-size:var(--fs-12);font-weight:400;color:var(--color-text-sub)">万</span></div></div>
            <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">累计节省</div><div style="font-size:var(--fs-20);font-weight:700;color:var(--color-success)">¥${((s.savedAmount || 0) / 1000).toFixed(1)}<span style="font-size:var(--fs-12);font-weight:400;color:var(--color-text-sub)">千</span></div></div>
            <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">询价记录</div><div style="font-size:var(--fs-20);font-weight:700">${s.inquiryCount || 0}<span style="font-size:var(--fs-12);font-weight:400;color:var(--color-text-sub)">条</span></div></div>
          </div>
        </div>
      </div>
    </div>`;
}

function escapeAttr(s) { return JSON.stringify(s).replace(/'/g, "\\'"); }
function fillPrompt(t) { const i = document.getElementById("chat-input"); if (i) { i.value = t; i.focus(); } }

async function sendPrompt() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;
  const c = document.getElementById("chat-container");
  c.innerHTML += `<div class="chat-msg user"><div class="chat-avatar user">${(state.meta && state.meta.user.avatar) || "我"}</div><div><div class="chat-bubble">${text}</div><div class="chat-time">刚刚</div></div></div>`;
  input.value = "";
  c.scrollTop = c.scrollHeight;
  const lid = "loading-" + Date.now();
  c.innerHTML += `<div class="chat-msg ai" id="${lid}"><div class="chat-avatar ai">AI</div><div><div class="chat-bubble"><span class="skeleton" style="width:120px;height:14px"></span> <span class="skeleton" style="width:80px;height:14px;margin-left:8px"></span></div></div></div>`;
  c.scrollTop = c.scrollHeight;
  let result;
  try { result = await api.chat(text); }
  catch (e) { document.getElementById(lid).innerHTML = `<div class="chat-avatar ai">AI</div><div><div class="chat-bubble">请求失败：${e.message}</div><div class="chat-time">刚刚</div></div>`; return; }
  const { parsed, products } = result;
  const best = products[0];
  const purchase = best.platforms.find(p => p.key === "1688");
  const retailMin = Math.min(...best.platforms.filter(p => p.key !== "1688").map(p => p.price));
  const modeLabel = parsed.mode === "A" ? `<span class="tag tag-primary">模式A 大模型</span>` : `<span class="tag tag-warning">模式B 规则降级</span>`;
  const parsedBox = `<div class="parsed-box"><div style="font-size:var(--fs-12);color:var(--color-text-disabled);margin-bottom:var(--spacing-1)">解析结果（${parsed.note}）</div><div class="parsed-row"><span class="pk">品类</span><span class="pv">${parsed.category}</span></div><div class="parsed-row"><span class="pk">规格</span><span class="pv">${parsed.spec}</span></div><div class="parsed-row"><span class="pk">数量</span><span class="pv">${parsed.quantity}</span></div><div class="parsed-row"><span class="pk">预算</span><span class="pv">${parsed.budget ? "¥" + parsed.budget + "/个" : "未指定"}</span></div><div class="parsed-row"><span class="pk">来源</span><span class="pv">${parsed.source} · ${parsed.mode}</span></div></div>`;
  const reply = `已解析需求，在 1688 / 淘宝 / 京东 / 拼多多找到 ${products.length} 款匹配标品。${best.name} 的 1688 采购价 ¥${purchase.price}（${best.moq}起订），零售最低 ¥${retailMin}。`;
  const extra = `<div style="margin-top:var(--spacing-2)">${modeLabel}</div>${parsedBox}<div style="margin-top:var(--spacing-2)"><button class="btn btn-primary btn-sm" onclick="navTo('compare','${best.productId}')">${ICONS["scale"]}<span>查看比价结果</span></button></div>`;
  state.chatHistory.push({ role: "ai", text: reply, bubble: reply, extra, time: "刚刚" });
  document.getElementById(lid).innerHTML = `<div class="chat-avatar ai">AI</div><div><div class="chat-bubble">${reply}</div><div style="margin-top:var(--spacing-2)">${modeLabel}</div>${parsedBox}<div style="margin-top:var(--spacing-2)"><button class="btn btn-primary btn-sm" onclick="navTo('compare','${best.productId}')">${ICONS["scale"]}<span>查看比价结果</span></button></div><div class="chat-time">刚刚</div></div>`;
  c.scrollTop = c.scrollHeight;
}

/* ===== 视图2：比价结果 ===== */
function viewCompare(data) {
  const p = data.product;
  const purchase = p.platforms.find(x => x.key === "1688");
  const retail = p.platforms.filter(x => x.key !== "1688");
  const retailMin = Math.min(...retail.map(x => x.price));
  const spread = (retailMin - purchase.price).toFixed(2);
  const spreadPct = Math.round((retailMin - purchase.price) / retailMin * 100);
  const platforms = state.meta ? state.meta.platforms : [];
  return `
    <a class="btn btn-text btn-sm" onclick="navTo('home')" style="margin-bottom:var(--spacing-3)">${ICONS["arrow-left"]}<span>返回对话</span></a>
    <div class="card" style="margin-bottom:var(--spacing-4)">
      <div class="card-body" style="display:flex;gap:var(--spacing-5)">
        <img src="${p.image}" style="width:96px;height:96px;border-radius:var(--radius-sm);object-fit:cover;background:var(--color-bg)" alt="">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:var(--spacing-2);margin-bottom:var(--spacing-1)">
            <span style="font-size:var(--fs-16);font-weight:600">${p.name}</span><span class="tag tag-default">${p.category}</span>
          </div>
          <div style="font-size:var(--fs-13);color:var(--color-text-sub);margin-bottom:var(--spacing-3)">规格：${p.spec} · 起订量：${p.moq}${p.unit} · 单位：${p.unit}</div>
          <div style="display:flex;gap:var(--spacing-6)">
            <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">1688 采购价</div><div style="font-size:var(--fs-20);font-weight:700;color:var(--color-danger)">¥${purchase.price}</div></div>
            <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">零售最低</div><div style="font-size:var(--fs-20);font-weight:700">¥${retailMin}</div></div>
            <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">价差/利润</div><div style="font-size:var(--fs-20);font-weight:700;color:var(--color-success)">¥${spread} <span style="font-size:var(--fs-12)">(${spreadPct}%)</span></div></div>
          </div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:var(--spacing-4)">
      <div class="card-header"><span class="card-title">跨平台价格</span><span class="tag tag-success">采购价 vs 零售价</span></div>
      <div class="card-body" style="padding:0">
        ${p.platforms.map(pp => {
          const plat = platforms.find(x => x.key === pp.key) || { color: "#999", logo: pp.key };
          const isPur = pp.key === "1688";
          return `<div class="platform-row ${isPur ? "is-purchase" : ""}">
            <div class="platform-logo" style="background:${plat.color}">${plat.logo}</div>
            <div class="platform-info"><div class="platform-name">${plat.name} ${isPur ? '<span class="tag tag-success">采购</span>' : '<span class="tag tag-default">零售</span>'}</div><div class="platform-shop">${pp.shopName} · 销量${pp.sold} · 评分${pp.rating}</div></div>
            <div class="platform-price">¥${pp.price}<span class="label">原价 ¥${pp.originalPrice}</span></div>
            <div class="platform-actions"><a class="btn btn-sm" href="${pp.link}" target="_blank">${ICONS["external-link"]}<span>来源</span></a></div>
          </div>`;
        }).join("")}
      </div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">中立采购建议</span><span class="tag tag-primary">不拿佣金</span></div><div class="card-body"><p style="font-size:var(--fs-14);color:var(--color-text-sub);margin-bottom:var(--spacing-3)">建议在 1688 以 <strong style="color:var(--color-text)">¥${purchase.price}</strong>/${p.unit} 采购 ${p.moq}${p.unit}起订。对比零售最低价 ¥${retailMin}，单件可省 <strong style="color:var(--color-success)">¥${spread}</strong>（${spreadPct}%）。</p><p style="font-size:var(--fs-13);color:var(--color-text-sub)">本建议基于客观价格数据生成，不按佣金排序，不导流分销链接。</p></div></div>
      <div class="card"><div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">数据来源审计</span><span class="tag tag-success">${ICONS["shield"]}<span>可审计</span></span></div><div class="card-body" style="padding:0">${p.platforms.map(pp => { const plat = platforms.find(x => x.key === pp.key) || { name: pp.key }; return `<div class="audit-row"><span class="dot"></span><span><strong>${plat.name}</strong> · ${pp.shopName}</span><span>抓取时间：${pp.fetchedAt}</span><a class="btn-text btn-sm" href="${pp.link}" target="_blank">原始链接</a></div>`; }).join("")}</div></div>
    </div>
    <div style="margin-top:var(--spacing-4);display:flex;gap:var(--spacing-3)">
      <button class="btn btn-primary" onclick="navTo('history','${p.id}')">${ICONS["trending"]}<span>查看历史低价曲线</span></button>
      <button class="btn" onclick="openAlertModal('${p.id}')">${ICONS["bell"]}<span>设置降价提醒</span></button>
    </div>`;
}

/* ===== 视图3：历史价格 ===== */
function viewHistory(data) {
  const p = data.product;
  const hist = p.history;
  const min = Math.min(...hist), max = Math.max(...hist);
  const cur = hist[hist.length - 1];
  const curPos = Math.round(hist.filter(v => v <= cur).length / hist.length * 100);
  const isLow = cur <= min * 1.05;
  return `
    <a class="btn btn-text btn-sm" onclick="navTo('compare')" style="margin-bottom:var(--spacing-3)">${ICONS["arrow-left"]}<span>返回比价</span></a>
    <div class="card" style="margin-bottom:var(--spacing-4)">
      <div class="card-header"><span class="card-title">${p.name} · 30 天价格走势</span><span class="tag ${isLow ? "tag-success" : "tag-warning"}">${isLow ? "接近低价" : "非低价区"}</span></div>
      <div class="card-body">
        <div style="display:flex;gap:var(--spacing-6);margin-bottom:var(--spacing-4)">
          <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">当前价</div><div style="font-size:var(--fs-20);font-weight:700;color:var(--color-danger)">¥${cur}</div></div>
          <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">30天最低</div><div style="font-size:var(--fs-20);font-weight:700;color:var(--color-success)">¥${min}</div></div>
          <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">30天最高</div><div style="font-size:var(--fs-20);font-weight:700">¥${max}</div></div>
          <div><div style="font-size:var(--fs-12);color:var(--color-text-sub)">当前分位</div><div style="font-size:var(--fs-20);font-weight:700">${curPos}%</div></div>
        </div>
        ${priceChartSVG(hist)}
        <div class="chart-legend"><div class="lg-item"><span class="lg-dot" style="background:var(--color-primary)"></span>1688 采购价</div><div class="lg-item"><span class="lg-dot" style="background:var(--color-success)"></span>最低点</div><div class="lg-item"><span class="lg-dot" style="background:var(--color-danger);height:8px;width:8px;border-radius:50%"></span>当前</div></div>
      </div>
    </div>
    <div class="card"><div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">价格解读</span></div><div class="card-body"><p style="font-size:var(--fs-14);color:var(--color-text-sub)">近 30 天 1688 采购价在 ¥${min} ~ ¥${max} 间波动。当前价 ¥${cur} 处于${curPos < 30 ? "低位" : curPos < 70 ? "中位" : "高位"}（${curPos}% 分位），${isLow ? "接近历史低价，适合入手" : "距最低价 ¥" + min + " 尚有空间，可设降价提醒等待"}。</p><div style="margin-top:var(--spacing-3)"><button class="btn btn-primary btn-sm" onclick="openAlertModal('${p.id}')">${ICONS["bell"]}<span>设置降价提醒</span></button></div></div></div>`;
}

function priceChartSVG(data) {
  const w = 720, h = 200, pad = 30;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / range) * (h - pad * 2)]);
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const areaPath = path + ` L${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L${pad} ${h - pad} Z`;
  const minIdx = data.indexOf(min), curIdx = data.length - 1;
  const grid = [0, 0.25, 0.5, 0.75, 1].map(t => { const y = h - pad - t * (h - pad * 2); const val = (min + range * t).toFixed(2); return `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="#f0f2f5" stroke-width="1"/><text x="${pad - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#86909c">¥${val}</text>`; }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block">${grid}<path d="${areaPath}" fill="rgba(22,119,255,0.08)"/><path d="${path}" fill="none" stroke="#1677ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${pts[minIdx][0]}" cy="${pts[minIdx][1]}" r="4" fill="#00b42a"/><text x="${pts[minIdx][0]}" y="${pts[minIdx][1] - 10}" text-anchor="middle" font-size="10" fill="#00b42a" font-weight="600">低 ¥${min}</text><circle cx="${pts[curIdx][0]}" cy="${pts[curIdx][1]}" r="5" fill="#f53f3f"/><text x="${pts[curIdx][0]}" y="${pts[curIdx][1] - 12}" text-anchor="middle" font-size="10" fill="#f53f3f" font-weight="600">现 ¥${data[curIdx]}</text></svg>`;
}

/* ===== 视图4：我的提醒 ===== */
function viewAlerts(data) {
  const alerts = data.alerts || [];
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-4)">
      <div><h2 style="font-size:var(--fs-20);font-weight:600">降价提醒</h2><p style="font-size:var(--fs-13);color:var(--color-text-sub)">设定目标价，跌破即触发提醒</p></div>
      <button class="btn btn-primary btn-sm" onclick="openAlertModal()">${ICONS["plus"]}<span>新建提醒</span></button>
    </div>
    <div class="card"><div class="card-body" style="padding:0">
      ${alerts.length === 0 ? `<div class="empty-state"><div class="title">暂无提醒</div><div class="desc">设置降价提醒后，价格跌破目标会在此提示</div></div>` :
      `<table class="data-table"><thead><tr><th>商品</th><th>目标价</th><th>当前价</th><th>状态</th><th>创建时间</th><th></th></tr></thead><tbody>${alerts.map(a => { const triggered = a.currentPrice <= a.targetPrice; return `<tr><td>${a.productName}</td><td style="font-weight:600">¥${a.targetPrice}</td><td>¥${a.currentPrice}</td><td>${triggered ? '<span class="tag tag-danger">已触发</span>' : '<span class="tag tag-success">监控中</span>'}</td><td style="color:var(--color-text-disabled)">${a.createdTime}</td><td><a class="btn-text btn-sm" onclick="deleteAlert('${a.id}')">删除</a></td></tr>`; }).join("")}</tbody></table>`}
    </div></div>`;
}

async function deleteAlert(id) {
  await api.deleteAlert(id);
  toast("已删除提醒");
  loadView();
}

function openAlertModal(productId) {
  const p = productId ? null : null;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal" id="alert-modal"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-4)"><span style="font-size:var(--fs-16);font-weight:600">设置降价提醒</span><a class="btn-text" onclick="closeModal()">关闭</a></div><div id="modal-body">${loading()}</div></div>`;
  overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  if (productId) {
    api.compare(productId).then(d => {
      const p = d.product;
      const cur = p.platforms.find(x => x.key === "1688").price;
      document.getElementById("modal-body").innerHTML = `
        <div style="font-size:var(--fs-13);color:var(--color-text-sub);margin-bottom:var(--spacing-2)">商品：${p.name}</div>
        <div style="font-size:var(--fs-13);color:var(--color-text-sub);margin-bottom:var(--spacing-4)">当前 1688 采购价：<strong style="color:var(--color-danger)">¥${cur}</strong></div>
        <label style="font-size:var(--fs-13);color:var(--color-text-sub);display:block;margin-bottom:var(--spacing-2)">目标价（跌破即提醒）</label>
        <input type="number" id="alert-target" placeholder="如 ${(cur - 0.5).toFixed(1)}" step="0.1" value="${(cur - 0.5).toFixed(1)}">
        <div style="display:flex;justify-content:flex-end;gap:var(--spacing-2);margin-top:var(--spacing-4)"><button class="btn" onclick="closeModal()">取消</button><button class="btn btn-primary" onclick="saveAlert('${p.id}',${cur})">确认设置</button></div>`;
      setTimeout(() => document.getElementById("alert-target") && document.getElementById("alert-target").focus(), 50);
    });
  } else {
    document.getElementById("modal-body").innerHTML = `<div class="empty-state" style="padding:24px"><div class="desc">请从比价页或历史价格页设置提醒</div></div>`;
  }
}

function closeModal() { const m = document.querySelector(".modal-overlay"); if (m) m.remove(); }

async function saveAlert(productId, cur) {
  const target = parseFloat(document.getElementById("alert-target").value);
  if (!target || target <= 0) { toast("请输入有效目标价", "warning"); return; }
  await api.addAlert(productId, target);
  closeModal();
  toast("提醒已设置");
  navTo("alerts");
}

function toast(msg, type) {
  const c = document.getElementById("toast-container");
  const t = document.createElement("div");
  t.className = "toast-item";
  t.style.borderLeftColor = type === "warning" ? "#ff7d00" : "#00b42a";
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .3s"; setTimeout(() => t.remove(), 300); }, 2200);
}

/* ===== 视图5：数据分析 ===== */
function viewAnalytics(data) {
  const s = data.summary || {};
  const byEvent = data.byEvent || {};
  const topSearches = data.topSearches || [];
  const recentEvents = data.recentEvents || [];
  const feedback = data.feedback || [];

  const eventBars = Object.entries(byEvent).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
    const max = Math.max(...Object.values(byEvent));
    const pct = Math.round(count / max * 100);
    const labelMap = { page_view: "页面浏览", chat_search: "AI搜索", view_compare: "查看比价", view_history: "查看历史价", alert_create: "设置提醒" };
    return `<div class="bar-row"><span class="bar-label">${labelMap[name] || name}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-val">${count}</span></div>`;
  }).join("");

  const searchTags = topSearches.length > 0
    ? topSearches.map(t => `<span class="chip">${t.word} <span style="color:var(--color-text-disabled)">×${t.count}</span></span>`).join("")
    : `<span style="color:var(--color-text-disabled);font-size:var(--fs-13)">暂无搜索记录</span>`;

  const eventList = recentEvents.slice(0, 15).map(ev => {
    const labelMap = { page_view: "浏览页面", chat_search: "AI搜索", view_compare: "查看比价", view_history: "查看历史价", alert_create: "设置提醒" };
    const detail = ev.detail ? Object.entries(ev.detail).filter(([k]) => k !== "sessionId").map(([k,v]) => `${k}: ${typeof v === "string" ? v.slice(0,40) : v}`).join(" · ") : "";
    return `<tr><td style="color:var(--color-text-sub)">${(ev.timestamp||"").slice(11,19)}</td><td>${labelMap[ev.event] || ev.event}</td><td style="color:var(--color-text-sub);font-size:var(--fs-13)">${detail}</td></tr>`;
  }).join("");

  const feedbackList = feedback.length > 0
    ? feedback.map(f => `<div class="card" style="margin-bottom:12px"><div class="card-body" style="padding:12px 16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span class="tag ${f.type === "bug" ? "tag-danger" : f.type === "complaint" ? "tag-warning" : "tag-primary"}">${f.type === "bug" ? "Bug" : f.type === "complaint" ? "投诉" : "建议"}</span>${f.rating ? `<span style="color:var(--color-warning)">★${f.rating}</span>` : ""}</div><p style="font-size:var(--fs-14);color:var(--color-text)">${f.content}</p>${f.contact ? `<p style="font-size:var(--fs-12);color:var(--color-text-disabled);margin-top:4px">联系方式：${f.contact}</p>` : ""}</div></div>`).join("")
    : `<div class="empty-state"><div class="desc">暂无用户反馈</div></div>`;

  return `
    <div class="grid-4" style="margin-bottom:var(--spacing-4)">
      <div class="card stat-card"><div class="card-body"><div style="font-size:var(--fs-12);color:var(--color-text-sub)">总事件数</div><div style="font-size:var(--fs-24);font-weight:700">${s.totalEvents || 0}</div></div></div>
      <div class="card stat-card"><div class="card-body"><div style="font-size:var(--fs-12);color:var(--color-text-sub)">会话数</div><div style="font-size:var(--fs-24);font-weight:700">${s.totalSessions || 1}</div></div></div>
      <div class="card stat-card"><div class="card-body"><div style="font-size:var(--fs-12);color:var(--color-text-sub)">运行时长</div><div style="font-size:var(--fs-24);font-weight:700">${Math.floor((s.uptime || 0) / 60)}<span style="font-size:var(--fs-14);font-weight:400">分</span></div></div></div>
      <div class="card stat-card"><div class="card-body"><div style="font-size:var(--fs-12);color:var(--color-text-sub)">反馈数</div><div style="font-size:var(--fs-24);font-weight:700">${s.feedbackCount || 0}</div></div></div>
    </div>
    <div class="grid-2" style="margin-bottom:var(--spacing-4)">
      <div class="card"><div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">事件分布</span></div><div class="card-body">${eventBars || '<div class="empty-state"><div class="desc">暂无数据</div></div>'}</div></div>
      <div class="card"><div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">热门搜索词</span></div><div class="card-body"><div style="display:flex;flex-wrap:wrap;gap:8px">${searchTags}</div></div></div>
    </div>
    <div class="card" style="margin-bottom:var(--spacing-4)"><div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">最近事件流</span></div><div class="card-body" style="padding:0">${recentEvents.length > 0 ? `<table class="data-table"><thead><tr><th style="width:80px">时间</th><th style="width:120px">事件</th><th>详情</th></tr></thead><tbody>${eventList}</tbody></table>` : '<div class="empty-state"><div class="desc">暂无事件</div></div>'}</div></div>
    <div class="card"><div class="card-header"><span class="card-title" style="font-size:var(--fs-14)">用户反馈</span><button class="btn btn-primary btn-sm" onclick="openFeedbackModal()">${ICONS["plus"]}<span>提交反馈</span></button></div><div class="card-body">${feedbackList}</div></div>`;
}

/* ===== 反馈弹窗 ===== */
function openFeedbackModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal" id="feedback-modal" style="max-width:480px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-4)">
      <span style="font-size:var(--fs-16);font-weight:600">提交反馈</span>
      <a class="btn-text" onclick="closeModal()">关闭</a>
    </div>
    <div style="margin-bottom:var(--spacing-3)">
      <label style="font-size:var(--fs-13);color:var(--color-text-sub);display:block;margin-bottom:var(--spacing-2)">反馈类型</label>
      <select id="fb-type" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--fs-14)">
        <option value="suggestion">功能建议</option>
        <option value="bug">问题反馈</option>
        <option value="complaint">体验投诉</option>
      </select>
    </div>
    <div style="margin-bottom:var(--spacing-3)">
      <label style="font-size:var(--fs-13);color:var(--color-text-sub);display:block;margin-bottom:var(--spacing-2)">评分（1-5星）</label>
      <div id="fb-rating" style="display:flex;gap:4px">
        ${[1,2,3,4,5].map(n => `<span class="star" data-val="${n}" onclick="selectStar(${n})" style="cursor:pointer;font-size:24px;color:var(--color-border)">★</span>`).join("")}
      </div>
    </div>
    <div style="margin-bottom:var(--spacing-3)">
      <label style="font-size:var(--fs-13);color:var(--color-text-sub);display:block;margin-bottom:var(--spacing-2)">详细描述</label>
      <textarea id="fb-content" rows="4" placeholder="请描述您的建议或遇到的问题…" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--fs-14);resize:vertical"></textarea>
    </div>
    <div style="margin-bottom:var(--spacing-4)">
      <label style="font-size:var(--fs-13);color:var(--color-text-sub);display:block;margin-bottom:var(--spacing-2)">联系方式（选填）</label>
      <input type="text" id="fb-contact" placeholder="微信/邮箱/手机号" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--fs-14)">
    </div>
    <div style="display:flex;justify-content:flex-end;gap:var(--spacing-2)">
      <button class="btn" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="submitFeedback()">提交</button>
    </div>
  </div>`;
  overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}

let selectedRating = 0;
function selectStar(n) {
  selectedRating = n;
  document.querySelectorAll("#fb-rating .star").forEach((s, i) => {
    s.style.color = i < n ? "#ff7d00" : "var(--color-border)";
  });
}

async function submitFeedback() {
  const type = document.getElementById("fb-type").value;
  const content = document.getElementById("fb-content").value.trim();
  const contact = document.getElementById("fb-contact").value.trim();
  if (!content) { toast("请填写反馈内容", "warning"); return; }
  try {
    await api.feedback({ type, content, contact, rating: selectedRating || null, page: state.view });
    track("feedback_submit", { type, rating: selectedRating });
    closeModal();
    toast("反馈已提交，感谢！");
  } catch (e) {
    toast("提交失败：" + e.message, "warning");
  }
}

/* ===== 启动 ===== */
async function init() {
  try {
    const [meta, engine] = await Promise.all([api.meta(), api.engine()]);
    state.meta = meta;
    state.engine = engine;
  } catch (e) {
    document.getElementById("app-shell").innerHTML = `<div class="app-content"><div class="app-body"><div class="loading-block">服务未启动，请先运行 node server.js<br>${e.message}</div></div></div>`;
    return;
  }
  render();
  track("page_view", { view: "home" });
}
init();
