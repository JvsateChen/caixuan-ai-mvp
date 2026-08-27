// 埋点数据层 —— 轻量级行为采集 + 用户反馈收集
// MVP 阶段用内存存储，生产环境可替换为数据库（接口不变）

const STORE = {
  events: [],
  feedback: [],
  sessionStart: new Date().toISOString()
};

function track(event) {
  const entry = {
    id: "EV" + Date.now() + Math.random().toString(36).slice(2, 6),
    event: event.event || "unknown",
    page: event.page || null,
    detail: event.detail || null,
    timestamp: new Date().toISOString()
  };
  STORE.events.push(entry);
  if (STORE.events.length > 2000) STORE.events.shift();
  return entry;
}

function addFeedback(fb) {
  const entry = {
    id: "FB" + Date.now(),
    type: fb.type || "suggestion",
    content: fb.content || "",
    contact: fb.contact || "",
    rating: fb.rating || null,
    page: fb.page || null,
    status: "open",
    timestamp: new Date().toISOString()
  };
  STORE.feedback.unshift(entry);
  if (STORE.feedback.length > 500) STORE.feedback.pop();
  return entry;
}

function getAnalytics() {
  const events = STORE.events;
  const byEvent = {};
  const byPage = {};
  const byHour = {};

  for (const ev of events) {
    byEvent[ev.event] = (byEvent[ev.event] || 0) + 1;
    if (ev.page) byPage[ev.page] = (byPage[ev.page] || 0) + 1;
    const hr = (ev.timestamp || "").slice(0, 13);
    byHour[hr] = (byHour[hr] || 0) + 1;
  }

  const searches = events.filter(e => e.event === "chat_search").map(e => ({
    query: e.detail?.prompt || "",
    time: e.timestamp,
    resultCount: e.detail?.resultCount ?? null,
    mode: e.detail?.mode || null
  }));

  const compareViews = events.filter(e => e.event === "view_compare");
  const alertSets = events.filter(e => e.event === "alert_create");
  const feedbackCount = STORE.feedback.length;

  return {
    summary: {
      totalEvents: events.length,
      totalSessions: new Set(events.map(e => e.detail?.sessionId).filter(Boolean)).size || 1,
      uptime: Math.round((Date.now() - new Date(STORE.sessionStart).getTime()) / 1000),
      feedbackCount
    },
    byEvent,
    byPage,
    byHour: Object.entries(byHour).sort((a, b) => a[0].localeCompare(b[0])).slice(-24),
    searches: searches.slice(-20),
    topSearches: topKeywords(searches.map(s => s.query)),
    compareViews: compareViews.length,
    alertSets: alertSets.length,
    recentEvents: events.slice(-50).reverse(),
    feedback: STORE.feedback.slice(0, 20)
  };
}

function topKeywords(queries) {
  const freq = {};
  for (const q of queries) {
    if (!q) continue;
    const words = q.split(/[\s,，、]+/).filter(w => w.length > 1);
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, count]) => ({ word, count }));
}

module.exports = { track, addFeedback, getAnalytics, STORE };
